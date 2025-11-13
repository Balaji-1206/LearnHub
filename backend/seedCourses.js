require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('./src/models/Course');

const slugify = (s) => s.toLowerCase().replace(/[^\w]+/g, '-').replace(/^-|-$/g, '');

const courses = [
  { title: 'Web Development Fundamentals', description: 'Learn HTML, CSS, and JavaScript basics', longDescription: 'Start building websites with a strong foundation in HTML, CSS and vanilla JavaScript. Includes practical projects and exercises.', duration: '6 weeks', level: 'beginner', tags: ['web', 'beginner'], price: 29.99, published: true },
  { title: 'Advanced React Patterns', description: 'Master hooks, context, and state management', longDescription: 'Deep dive into advanced patterns in React including hooks, render props, higher-order components, and state management strategies.', duration: '4 weeks', level: 'advanced', tags: ['react', 'advanced'], price: 49.99, published: true },
  { title: 'Node.js Backend Development', description: 'Build scalable backend applications with Node.js and Express', longDescription: 'Learn how to design and build RESTful APIs with Node.js and Express, connect to databases, and deploy services.', duration: '5 weeks', level: 'intermediate', tags: ['nodejs', 'backend'], price: 39.99, published: true },
  { title: 'Python for Data Science', description: 'Learn Python, pandas, and data visualization', longDescription: 'Work with data using Python libraries like pandas, matplotlib and seaborn, and learn basic ML workflows.', duration: '6 weeks', level: 'intermediate', tags: ['python', 'data'], price: 44.99, published: true },
  { title: 'Machine Learning Basics', description: 'Introduction to machine learning algorithms and applications', longDescription: 'Understand supervised and unsupervised learning, model evaluation, and practical examples using scikit-learn.', duration: '8 weeks', level: 'intermediate', tags: ['ml', 'data'], price: 59.99, published: true },
  { title: 'Mobile App Development with React Native', description: 'Build cross-platform mobile apps', longDescription: 'Create native-feeling mobile apps using React Native, access device APIs, and publish to app stores.', duration: '5 weeks', level: 'intermediate', tags: ['react-native', 'mobile'], price: 54.99, published: true },
  { title: 'Database Design and SQL', description: 'Master relational databases and SQL queries', longDescription: 'Design normalized schemas and write efficient SQL queries for analytics and application backends.', duration: '4 weeks', level: 'beginner', tags: ['database', 'sql'], price: 34.99, published: true },
  { title: 'Cloud Computing with AWS', description: 'Deploy and scale applications on AWS', longDescription: 'Learn EC2, S3, IAM, RDS and serverless patterns for deploying scalable applications on AWS.', duration: '6 weeks', level: 'intermediate', tags: ['aws', 'cloud'], price: 64.99, published: true },
  { title: 'DevOps and CI/CD', description: 'Automate deployment with Docker, Kubernetes, and CI/CD pipelines', longDescription: 'Set up CI pipelines, containerize applications with Docker and orchestrate with Kubernetes.', duration: '6 weeks', level: 'advanced', tags: ['devops', 'docker'], price: 69.99, published: true },
  { title: 'TypeScript Mastery', description: 'Learn TypeScript for large-scale applications', longDescription: 'Add static typing to JavaScript projects, configure tsconfig, and use generics and advanced types.', duration: '4 weeks', level: 'intermediate', tags: ['typescript', 'intermediate'], price: 39.99, published: true },
  { title: 'Vue.js for Front-End Development', description: 'Build interactive UIs with Vue.js', longDescription: 'Learn Vue core concepts, components, routing and state management with Vuex.', duration: '4 weeks', level: 'intermediate', tags: ['vue', 'frontend'], price: 44.99, published: true },
  { title: 'GraphQL API Development', description: 'Learn GraphQL to build flexible APIs', longDescription: 'Design schemas, write resolvers and consume GraphQL APIs from clients.', duration: '4 weeks', level: 'intermediate', tags: ['graphql', 'api'], price: 49.99, published: true },
  { title: 'Cybersecurity Essentials', description: 'Protect your applications and data', longDescription: 'Cover common security vulnerabilities, secure coding practices and basic threat modelling.', duration: '3 weeks', level: 'beginner', tags: ['security', 'beginner'], price: 54.99, published: true },
  { title: 'UI/UX Design Principles', description: 'Design beautiful and usable interfaces', longDescription: 'Principles of visual design, prototyping and usability testing to create delightful experiences.', duration: '3 weeks', level: 'beginner', tags: ['design', 'ux'], price: 39.99, published: true },
  { title: 'Agile and Scrum Methodology', description: 'Lead teams with Agile best practices', longDescription: 'Learn Scrum ceremonies, roles, and how to run effective sprints and retrospectives.', duration: '2 weeks', level: 'beginner', tags: ['agile', 'management'], price: 29.99, published: true },
  { title: 'Blockchain and Cryptocurrency', description: 'Understand blockchain technology and smart contracts', longDescription: 'Learn blockchain fundamentals, smart contracts and decentralized application development.', duration: '6 weeks', level: 'advanced', tags: ['blockchain', 'crypto'], price: 74.99, published: true },
  { title: 'Java for Enterprise Applications', description: 'Build robust enterprise applications with Java', longDescription: 'Use Java and enterprise patterns to build scalable and maintainable systems.', duration: '6 weeks', level: 'intermediate', tags: ['java', 'enterprise'], price: 59.99, published: true },
  { title: 'Git and Version Control', description: 'Master Git workflows and collaboration', longDescription: 'Learn branching strategies, rebasing, resolving merge conflicts and collaborative workflows.', duration: '1 week', level: 'beginner', tags: ['git', 'tools'], price: 19.99, published: true },
  { title: 'System Design and Architecture', description: 'Design scalable systems and microservices', longDescription: 'High-level system design, scalability patterns, caches, queues and microservices architectures.', duration: '8 weeks', level: 'advanced', tags: ['architecture', 'advanced'], price: 79.99, published: true },
  { title: 'Full-Stack JavaScript Development', description: 'Build complete applications from frontend to backend', longDescription: 'End-to-end JavaScript development: React frontend, Node/Express backend, and MongoDB persistence.', duration: '7 weeks', level: 'intermediate', tags: ['javascript', 'fullstack'], price: 64.99, published: true }
];

async function seedCourses() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/learnhub', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB connected');

    // Clear existing courses (we remove them so the seed inserts fresh records)
    await Course.deleteMany({});

    // Add slugs to each course
    const coursesWithSlugs = courses.map(c => ({
      ...c,
      slug: slugify(c.title),
      cover: {
        filename: '',
        url: `https://via.placeholder.com/600x300.png?text=${encodeURIComponent(c.title)}`,
        mimetype: 'image/png'
      }
    }));

    // Insert courses
    const created = await Course.insertMany(coursesWithSlugs);
    console.log(`✓ ${created.length} courses created successfully!`);

    // List all published courses
    const allCourses = await Course.find({ published: true }).select('title slug price tags');
    console.log('\n--- Published Courses ---');
    allCourses.forEach((c, i) => {
      console.log(`${i + 1}. ${c.title} (${c.slug}) - $${c.price} - Tags: ${c.tags.join(', ')}`);
    });

    process.exit(0);
  } catch (err) {
    console.error('Error seeding courses:', err);
    process.exit(1);
  }
}

seedCourses();
