const { db } = require('./models');
const { Skill } = db;

const seedSkills = [
  { skill_name: 'JavaScript', category: 'Programming' },
  { skill_name: 'Python', category: 'Programming' },
  { skill_name: 'React', category: 'Programming' },
  { skill_name: 'Node.js', category: 'Programming' },
  { skill_name: 'HTML', category: 'Programming' },
  { skill_name: 'CSS', category: 'Programming' },
  { skill_name: 'SQL', category: 'Database' },
  { skill_name: 'Photoshop', category: 'Design' },
  { skill_name: 'Guitar', category: 'Music' },
  { skill_name: 'Cooking', category: 'Lifestyle' },
  { skill_name: 'Public Speaking', category: 'Communication' },
  { skill_name: 'Photography', category: 'Creative' },
  { skill_name: 'Writing', category: 'Creative' },
  { skill_name: 'Marketing', category: 'Business' },
  { skill_name: 'Graphic Design', category: 'Design' },
  { skill_name: 'Data Analysis', category: 'Analytics' },
  { skill_name: 'Project Management', category: 'Business' },
  { skill_name: 'Language Teaching', category: 'Education' },
  { skill_name: 'Mathematics', category: 'Education' },
  { skill_name: 'Web Design', category: 'Design' }
];

async function seedDatabase() {
  try {
    console.log('🌱 Seeding skills database...');

    // Clear existing skills (optional)
    // await Skill.destroy({ where: {} });

    // Insert skills
    for (const skill of seedSkills) {
      const [skillRecord, created] = await Skill.findOrCreate({
        where: { skill_name: skill.skill_name },
        defaults: skill
      });
      
      if (created) {
        console.log(`✅ Created skill: ${skill.skill_name}`);
      } else {
        console.log(`⚠️  Skill already exists: ${skill.skill_name}`);
      }
    }

    console.log('🎉 Skills seeding completed!');
    console.log(`📊 Total skills available: ${seedSkills.length}`);
    
  } catch (error) {
    console.error('❌ Error seeding skills:', error);
  }
}

// Run if called directly
if (require.main === module) {
  seedDatabase().then(() => {
    process.exit(0);
  }).catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
}

module.exports = { seedDatabase, seedSkills };