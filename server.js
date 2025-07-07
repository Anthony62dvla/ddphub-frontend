// 1. Import the necessary packages
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

// 2. Initialise the Express application
const app = express();
const PORT = 3001;

const JWT_SECRET = process.env.JWT_SECRET;

// --- Database Connection ---
// Make sure this is your actual connection string from your Supabase project.
const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
    connectionString: connectionString,
});

// 3. Apply middleware
app.use(cors());
app.use(express.json());


// --- Authentication Middleware ---
const authMiddleware = (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token, authorization denied.' });
    }
    try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded.user;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid.' });
    }
};

// --- Role-Based Permission Middleware ---
const isLeadProfessional = (req, res, next) => {
    if (req.user && req.user.role === 'lead_professional') {
        next();
    } else {
        res.status(403).json({ message: 'Forbidden: This action requires Lead Professional privileges.' });
    }
};


// --- API Endpoints ---

// --- Authentication Routes (Now fully database-driven) ---
app.post('/api/auth/register', async (req, res) => {
    try {
        const { fullName, email, password, role } = req.body;
        if (!fullName || !email || !password || !role) { return res.status(400).json({ message: 'Please provide all required fields.' }); }
        const existingUserResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (existingUserResult.rows.length > 0) { return res.status(400).json({ message: 'A user with this email already exists.' }); }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUserResult = await pool.query( 'INSERT INTO users (full_name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id', [fullName, email, hashedPassword, role] );
        console.log('New user registered and saved to database with ID:', newUserResult.rows[0].id);
        res.status(201).json({ message: 'User registered successfully!' });
    } catch (error) { console.error('Registration error:', error); res.status(500).json({ message: 'Server error during registration.' }); }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) { return res.status(400).json({ message: 'Please provide both email and password.' }); }
        const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userResult.rows.length === 0) { return res.status(401).json({ message: 'Invalid credentials.' }); }
        const user = userResult.rows[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) { return res.status(401).json({ message: 'Invalid credentials.' }); }
        const payload = { user: { id: user.id, role: user.role } };
        jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
            if (err) throw err;
            console.log(`User ${user.email} logged in successfully.`);
            res.status(200).json({
                message: 'Login successful!',
                token: token,
                user: { id: user.id, fullName: user.full_name, email: user.email, role: user.role }
            });
        });
    } catch (error) { console.error('Login error:', error); res.status(500).json({ message: 'Server error during login.' }); }
});


// --- DDP Profile Endpoints (Now fully database-driven) ---

// GET all profiles for the logged-in user
app.get('/api/profiles', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const query = `
            SELECT p.id, p.learner_name, p.status, p.last_updated, p.review_date
            FROM ddp_profiles p
            JOIN profile_permissions pp ON p.id = pp.profile_id
            WHERE pp.user_id = $1
            ORDER BY p.last_updated DESC;
        `;
        const { rows } = await pool.query(query, [userId]);
        res.status(200).json(rows);
    } catch (error) { console.error('Error fetching profiles:', error); res.status(500).json({ message: 'Server error fetching profiles.' }); }
});

// GET a single profile by its ID
app.get('/api/profiles/:id', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const profileId = parseInt(req.params.id, 10);
        const query = `
            SELECT p.* FROM ddp_profiles p
            JOIN profile_permissions pp ON p.id = pp.profile_id
            WHERE p.id = $1 AND pp.user_id = $2;
        `;
        const { rows } = await pool.query(query, [profileId, userId]);
        if (rows.length === 0) { return res.status(403).json({ message: 'Profile not found or access denied.' }); }
        res.status(200).json(rows[0]);
    } catch (error) { console.error(`Error fetching profile ${req.params.id}:`, error); res.status(500).json({ message: 'Server error fetching profile.' }); }
});

// POST (Create) a new DDP profile
app.post('/api/profiles', authMiddleware, isLeadProfessional, async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN'); // Start a transaction
        const creatorId = req.user.id;
        const { learnerName } = req.body;
        if (!learnerName) { return res.status(400).json({ message: 'Learner name is required.' }); }

        const blankSections = {
            1: { title: "Basic Information", content: { "Lead Professional": "Not Set" } },
            2: { title: "Learner's Voice: My Hopes and Dreams", content: "" },
            3: { title: "My Strengths & Talents", content: [] },
            4: { title: "My Differences & How I Learn Best", content: "" },
            5: { title: "My Curiosities & Interests", content: [] },
            6: { title: "Parent/Carer Perspectives & Aspirations", content: "" },
            7: { title: "Educator Observations & Key Information", content: "" },
            8: { title: "Summary of Assessed Needs/Key Areas for Development", content: "" },
            9: { title: "Agreed Outcomes/Goals (for this cycle)", content: [] },
            10: { title: "Planned Provision, Strategies & Adjustments", content: [] },
            11: { title: "Who is Responsible & When?", content: {} },
            12: { title: "How We Will Know It's Working (Success Criteria/Monitoring)", content: "" }
        };

        const profileQuery = 'INSERT INTO ddp_profiles (learner_name, sections) VALUES ($1, $2) RETURNING *;';
        const profileResult = await client.query(profileQuery, [learnerName, blankSections]);
        const newProfile = profileResult.rows[0];

        const permissionQuery = 'INSERT INTO profile_permissions (user_id, profile_id) VALUES ($1, $2);';
        await client.query(permissionQuery, [creatorId, newProfile.id]);

        await client.query('COMMIT'); // Commit the transaction
        console.log(`New DDP Profile created for ${learnerName} by user ID ${creatorId}.`);
        res.status(201).json(newProfile);
    } catch (error) {
        await client.query('ROLLBACK'); // Roll back the transaction on error
        console.error('Error creating new profile:', error);
        res.status(500).json({ message: 'Server error creating new profile.' });
    } finally {
        client.release(); // Release the client back to the pool
    }
});

// PUT (Update) a specific section of a DDP profile
app.put('/api/profiles/:profileId/section/:sectionNumber', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const profileId = parseInt(req.params.profileId, 10);
        const sectionNumber = req.params.sectionNumber;
        const { newContent } = req.body;

        // First, check for permission
        const permCheck = await pool.query('SELECT * FROM profile_permissions WHERE user_id = $1 AND profile_id = $2', [userId, profileId]);
        if (permCheck.rows.length === 0) { return res.status(403).json({ message: 'Forbidden: You do not have permission to edit this profile.' }); }
        
        // Update the JSONB field for the specific section
        const query = `
            UPDATE ddp_profiles
            SET sections = jsonb_set(sections, '{${sectionNumber}, content}', $1::jsonb),
                last_updated = NOW()
            WHERE id = $2
            RETURNING sections;
        `;
        const { rows } = await pool.query(query, [JSON.stringify(newContent), profileId]);

        if (rows.length === 0) { return res.status(404).json({ message: 'Profile not found.' }); }
        
        console.log(`Section ${sectionNumber} of profile ${profileId} updated successfully.`);
        res.status(200).json(rows[0].sections[sectionNumber]);
    } catch (error) { console.error(`Error updating profile section:`, error); res.status(500).json({ message: 'Server error updating profile section.' }); }
});

// POST (Invite) a contributor to a profile
app.post('/api/profiles/:profileId/invite', authMiddleware, isLeadProfessional, async (req, res) => {
    try {
        const profileId = parseInt(req.params.profileId, 10);
        const { email: inviteeEmail } = req.body;

        const inviteeResult = await pool.query('SELECT id FROM users WHERE email = $1', [inviteeEmail]);
        if (inviteeResult.rows.length === 0) { return res.status(404).json({ message: `User with email ${inviteeEmail} not found. Please ask them to register first.` }); }
        const inviteeId = inviteeResult.rows[0].id;

        const permCheck = await pool.query('SELECT * FROM profile_permissions WHERE user_id = $1 AND profile_id = $2', [inviteeId, profileId]);
        if (permCheck.rows.length > 0) { return res.status(400).json({ message: 'This user already has access to the profile.' }); }

        await pool.query('INSERT INTO profile_permissions (user_id, profile_id) VALUES ($1, $2)', [inviteeId, profileId]);
        
        console.log(`User ID ${inviteeId} has been invited to profile ID ${profileId}`);
        res.status(200).json({ message: `Successfully invited ${inviteeEmail} to the profile.` });
    } catch (error) { console.error('Error inviting contributor:', error); res.status(500).json({ message: 'Server error while inviting contributor.' }); }
});


// Start the server
app.listen(PORT, () => {
    console.log(`DDP Hub back-end server is running on http://localhost:${PORT}`);
});
