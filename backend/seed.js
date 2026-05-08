const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const User = require('./services/users/userModel');
const Skill = require('./services/skills/skillModel');
const Session = require('./services/sessions/sessionModel');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Skill.deleteMany({});
    await Session.deleteMany({});
    console.log('Cleared existing data');

    // Create users
    const users = await User.create([
      {
        name: 'Admin User',
        email: 'admin@skillswap.com',
        password: 'admin123',
        role: 'admin',
        bio: 'Platform administrator',
        department: 'Computer Science',
        year: 'Faculty'
      },
      {
        name: 'Pranavan Kumar',
        email: 'pranavan@bits.edu',
        password: 'password123',
        role: 'mentor',
        bio: 'Full-stack developer passionate about teaching web technologies and open source.',
        department: 'Computer Science',
        year: '3rd Year',
        rating: 4.8,
        totalReviews: 12
      },
      {
        name: 'Ananya Sharma',
        email: 'ananya@bits.edu',
        password: 'password123',
        role: 'student',
        bio: 'Design enthusiast learning to code. Love UI/UX and creative problem solving.',
        department: 'Design',
        year: '2nd Year',
        rating: 4.5,
        totalReviews: 8
      },
      {
        name: 'Rahul Menon',
        email: 'rahul@bits.edu',
        password: 'password123',
        role: 'mentor',
        bio: 'Data science enthusiast with a knack for machine learning and statistics.',
        department: 'Mathematics',
        year: '4th Year',
        rating: 4.6,
        totalReviews: 15
      },
      {
        name: 'Priya Nair',
        email: 'priya@bits.edu',
        password: 'password123',
        role: 'student',
        bio: 'Music lover exploring the intersection of technology and arts.',
        department: 'Electronics',
        year: '2nd Year',
        rating: 4.2,
        totalReviews: 5
      },
      {
        name: 'Karthik Rajan',
        email: 'karthik@bits.edu',
        password: 'password123',
        role: 'mentor',
        bio: 'Competitive programmer and algorithms enthusiast. Love teaching DSA.',
        department: 'Computer Science',
        year: '3rd Year',
        rating: 4.9,
        totalReviews: 20
      }
    ]);

    console.log(`Created ${users.length} users`);

    // Create skills
    const skills = await Skill.create([
      {
        name: 'React.js Development',
        category: 'technology',
        description: 'Learn to build modern web applications with React, hooks, context API, and state management.',
        proficiencyLevel: 'advanced',
        offeredBy: users[1]._id,
        tags: ['react', 'javascript', 'frontend', 'web']
      },
      {
        name: 'Python for Data Science',
        category: 'technology',
        description: 'Master Python for data analysis, visualization, and machine learning with pandas, numpy, and scikit-learn.',
        proficiencyLevel: 'advanced',
        offeredBy: users[3]._id,
        tags: ['python', 'data-science', 'machine-learning', 'analytics']
      },
      {
        name: 'UI/UX Design',
        category: 'design',
        description: 'Learn principles of user interface and user experience design using Figma and Adobe XD.',
        proficiencyLevel: 'intermediate',
        offeredBy: users[2]._id,
        tags: ['figma', 'design', 'ui', 'ux', 'prototyping']
      },
      {
        name: 'Guitar Basics',
        category: 'music',
        description: 'Learn acoustic guitar from scratch - chords, strumming patterns, and basic music theory.',
        proficiencyLevel: 'intermediate',
        offeredBy: users[4]._id,
        tags: ['guitar', 'music', 'acoustic', 'chords']
      },
      {
        name: 'Data Structures & Algorithms',
        category: 'academic',
        description: 'Master DSA concepts with hands-on problem solving. Covers arrays, trees, graphs, DP, and more.',
        proficiencyLevel: 'expert',
        offeredBy: users[5]._id,
        tags: ['dsa', 'algorithms', 'competitive-programming', 'leetcode']
      },
      {
        name: 'Node.js & Express',
        category: 'technology',
        description: 'Build scalable backend APIs with Node.js, Express, and MongoDB. RESTful design patterns.',
        proficiencyLevel: 'advanced',
        offeredBy: users[1]._id,
        tags: ['nodejs', 'express', 'backend', 'api', 'mongodb']
      },
      {
        name: 'Machine Learning',
        category: 'technology',
        description: 'Introduction to ML concepts - regression, classification, clustering, and neural networks.',
        proficiencyLevel: 'intermediate',
        offeredBy: users[3]._id,
        tags: ['ml', 'ai', 'deep-learning', 'tensorflow']
      },
      {
        name: 'Japanese Language',
        category: 'language',
        description: 'Learn basic Japanese - Hiragana, Katakana, basic Kanji, and conversational phrases.',
        proficiencyLevel: 'beginner',
        offeredBy: users[4]._id,
        tags: ['japanese', 'language', 'jlpt', 'hiragana']
      },
      {
        name: 'Graphic Design',
        category: 'design',
        description: 'Create stunning visuals with Photoshop and Illustrator. Logo design, posters, and branding.',
        proficiencyLevel: 'advanced',
        offeredBy: users[2]._id,
        tags: ['photoshop', 'illustrator', 'branding', 'graphics']
      },
      {
        name: 'Basketball Training',
        category: 'sports',
        description: 'Improve your basketball skills - dribbling, shooting form, defense, and game strategy.',
        proficiencyLevel: 'intermediate',
        offeredBy: users[5]._id,
        tags: ['basketball', 'sports', 'fitness', 'training']
      }
    ]);

    console.log(`Created ${skills.length} skills`);

    // Update users with their skills
    await User.findByIdAndUpdate(users[1]._id, { skillsOffered: [skills[0]._id, skills[5]._id] });
    await User.findByIdAndUpdate(users[2]._id, { skillsOffered: [skills[2]._id, skills[8]._id], skillsWanted: [skills[0]._id, skills[4]._id] });
    await User.findByIdAndUpdate(users[3]._id, { skillsOffered: [skills[1]._id, skills[6]._id] });
    await User.findByIdAndUpdate(users[4]._id, { skillsOffered: [skills[3]._id, skills[7]._id], skillsWanted: [skills[1]._id, skills[2]._id] });
    await User.findByIdAndUpdate(users[5]._id, { skillsOffered: [skills[4]._id, skills[9]._id] });

    // Create sessions
    const now = new Date();
    const sessions = await Session.create([
      {
        mentor: users[1]._id,
        learner: users[2]._id,
        skill: skills[0]._id,
        status: 'completed',
        scheduledDate: new Date(now - 7 * 24 * 60 * 60 * 1000),
        duration: 60,
        location: 'Library Room 3',
        notes: 'Covered React hooks and state management',
        rating: 5,
        review: 'Amazing session! Pranavan explained React hooks so clearly.',
        reviewedBy: users[2]._id
      },
      {
        mentor: users[3]._id,
        learner: users[4]._id,
        skill: skills[1]._id,
        status: 'completed',
        scheduledDate: new Date(now - 5 * 24 * 60 * 60 * 1000),
        duration: 90,
        location: 'Online - Google Meet',
        notes: 'Pandas and data visualization',
        rating: 4,
        review: 'Great introduction to pandas. Would love more practice problems.',
        reviewedBy: users[4]._id
      },
      {
        mentor: users[5]._id,
        learner: users[1]._id,
        skill: skills[4]._id,
        status: 'accepted',
        scheduledDate: new Date(now + 2 * 24 * 60 * 60 * 1000),
        duration: 120,
        location: 'CS Lab',
        notes: 'Dynamic Programming deep dive'
      },
      {
        mentor: users[2]._id,
        learner: users[3]._id,
        skill: skills[2]._id,
        status: 'pending',
        scheduledDate: new Date(now + 4 * 24 * 60 * 60 * 1000),
        duration: 60,
        location: 'Design Studio',
        notes: 'Figma basics and wireframing'
      },
      {
        mentor: users[4]._id,
        learner: users[2]._id,
        skill: skills[3]._id,
        status: 'accepted',
        scheduledDate: new Date(now + 1 * 24 * 60 * 60 * 1000),
        duration: 45,
        location: 'Music Room',
        notes: 'Basic chord progressions'
      }
    ]);

    console.log(`Created ${sessions.length} sessions`);
    console.log('\n✅ Database seeded successfully!');
    console.log('\n📋 Login credentials:');
    console.log('  Admin:   admin@skillswap.com / admin123');
    console.log('  Mentor:  pranavan@bits.edu / password123');
    console.log('  Student: ananya@bits.edu / password123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedData();
