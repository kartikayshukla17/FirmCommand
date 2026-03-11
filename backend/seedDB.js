import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config({ path: path.join(__dirname, '.env') });

import User from './models/User.js';
import Organization from './models/Organization.js';
import Task from './models/Task.js';

// MongoDB Connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected for seeding...');
    } catch (err) {
        console.error('Connection error:', err);
        process.exit(1);
    }
};

const seedData = async () => {
    try {
        await connectDB();

        // Clear existing data
        await User.deleteMany();
        await Organization.deleteMany();
        await Task.deleteMany();
        console.log('Cleared existing data.');

        // 1. Create Lead User first (to be Org owner)
        const passwordHash = await bcrypt.hash('password123', 10);
        const orgId = new mongoose.Types.ObjectId();
        const leadId = new mongoose.Types.ObjectId();
        
        const leadUser = await User.create({
            _id: leadId,
            username: "Harvey Specter",
            email: "harvey@psl.demo",
            password_hash: passwordHash,
            role: "Lead",
            organization: orgId,
            status: "Active",
            is_active: true
        });

        // 2. Create Organization using the Lead User ID
        const testOrg = await Organization.create({
            _id: orgId,
            name: "Pearson Specter Litt Demo",
            code: "PSL-DEMO",
            owner: leadUser._id
        });

        // Associates
        const associate1 = await User.create({
            username: "Mike Ross",
            email: "mike@psl.demo",
            password_hash: passwordHash,
            role: "Associate",
            organization: testOrg._id,
            status: "Active",
            is_active: true
        });

        const associate2 = await User.create({
            username: "Rachel Zane",
            email: "rachel@psl.demo",
            password_hash: passwordHash,
            role: "Associate",
            organization: testOrg._id,
            status: "Active",
            is_active: true
        });

        const associate3 = await User.create({
            username: "Louis Litt",
            email: "louis@psl.demo",
            password_hash: passwordHash,
            role: "Associate",
            organization: testOrg._id,
            status: "Active",
            is_active: true
        });

        console.log('Created Users.');

        // 3. Create Tasks
        const tasksToCreate = [
            // Pending Tasks
            {
                title: "Draft Merger Agreement for Gerson",
                description: "Initial draft of the merger contract. Needs to be bulletproof.",
                type: "Corporate",
                status: "Pending",
                assigned_to: associate1._id,
                assigned_by: leadUser._id,
                organization: testOrg._id,
                deadline: new Date(Date.now() + 86400000 * 2), // Due in 2 days
                createdAt: new Date(Date.now() - 86400000 * 1)
            },
            {
                title: "File Patents for Tech Innovations",
                description: "Urgent filing needed by EOD.",
                type: "Registry",
                status: "Pending",
                assigned_to: associate2._id,
                assigned_by: leadUser._id,
                organization: testOrg._id,
                deadline: new Date(Date.now() + 86400000 * 1) // Due tomorrow
            },
            {
                title: "Client Retainer Fee Processing",
                description: "Follow up on the $50k wire transfer from McKernon Motors.",
                type: "Payment",
                status: "Pending",
                assigned_to: associate3._id,
                assigned_by: leadUser._id,
                organization: testOrg._id,
                deadline: new Date() // Due today
            },

            // In Progress Tasks
            {
                title: "Review Non-Compete Clauses",
                description: "Scanning through the 400 pages of previous contracts.",
                type: "Custom",
                status: "In Progress",
                assigned_to: associate1._id,
                assigned_by: leadUser._id,
                organization: testOrg._id,
                started_at: new Date(Date.now() - 86400000 * 2),
                deadline: new Date(Date.now() + 86400000 * 4) // Due in 4 days
            },
            {
                title: "Real Estate Zoning Registration",
                description: "Sector 150 project.",
                type: "Registry",
                status: "In Progress",
                assigned_to: associate3._id,
                assigned_by: leadUser._id,
                organization: testOrg._id,
                started_at: new Date(Date.now() - 86400000 * 1),
                deadline: new Date(Date.now() + 86400000 * 7), // Due next week
                property_filters: { builder: "Gaursons", sector: "Sector 150" }
            },

            // Under Review Tasks
            {
                title: "Settle Hessington Oil Lawsuit",
                description: "Drafted the preliminary settlement details.",
                type: "Corporate",
                status: "Under Review",
                assigned_to: associate1._id,
                assigned_by: leadUser._id,
                organization: testOrg._id,
                started_at: new Date(Date.now() - 86400000 * 5),
                submitted_at: new Date(Date.now() - 86400000 * 1),
                proof_of_work: "https://docs.google.com/document/d/demo123",
                deadline: new Date(Date.now() + 86400000 * 1) 
            },

            // Completed Tasks
            {
                title: "Draft Initial Bylaws for Startup",
                description: "Standard tech startup bylaws package.",
                type: "Corporate",
                status: "Completed",
                assigned_to: associate2._id,
                assigned_by: leadUser._id,
                organization: testOrg._id,
                started_at: new Date(Date.now() - 86400000 * 10),
                submitted_at: new Date(Date.now() - 86400000 * 8),
                completed_at: new Date(Date.now() - 86400000 * 7),
                deadline: new Date(Date.now() - 86400000 * 5) // Was due 5 days ago
            },
            {
                title: "Tax Registration",
                description: "Filing state taxes for corporate entity.",
                type: "Payment",
                status: "Completed",
                assigned_to: associate1._id,
                assigned_by: leadUser._id,
                organization: testOrg._id,
                started_at: new Date(Date.now() - 86400000 * 15),
                completed_at: new Date(Date.now() - 86400000 * 14)
            },
            {
                title: "Subpoena Delivery",
                description: "Served Hardman.",
                type: "Custom",
                status: "Completed",
                assigned_to: associate2._id,
                assigned_by: leadUser._id,
                organization: testOrg._id,
                completed_at: new Date(Date.now() - 86400000 * 3)
            }
        ];

        await Task.insertMany(tasksToCreate);
        console.log(`Created ${tasksToCreate.length} Tasks.`);

        console.log('\n=============================================');
        console.log('✅ DATABASE SUCCESSFULLY SEEDED');
        console.log('=============================================');
        console.log('Organization: Pearson Specter Litt Demo');
        console.log('\n--- LEAD ACCOUNT ---');
        console.log('Email: harvey@psl.demo');
        console.log('Password: password123');
        console.log('\n--- ASSOCIATE ACCOUNTS ---');
        console.log('Email: mike@psl.demo');
        console.log('Email: rachel@psl.demo');
        console.log('Email: louis@psl.demo');
        console.log('Password (for all): password123');
        console.log('=============================================\n');

        process.exit(0);
    } catch (err) {
        console.error('Seeding Failed:', err);
        process.exit(1);
    }
};

seedData();
