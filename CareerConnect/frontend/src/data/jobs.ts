export type JobListing = {
  id?: string;
  _id?: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary?: string;
  workMode?: string;
  experienceLevel?: string;
  deadline?: string;
  companyLogo?: string;
  status?: string;
  experience?: string;
  description?: string;
  responsibilities?: string[];
  skills?: string[];
};

export type JobSearchResponse = {
  jobs: JobListing[];
  total: number;
  page: number;
  pages: number;
};

export function getJobId(job: JobListing) {
  return job._id ?? job.id ?? '';
}

export const jobs: JobListing[] = [
  {
    id: '1',
    title: 'Frontend Developer Intern',
    company: 'TechNova Solutions',
    location: 'Remote',
    type: 'Internship',
    salary: '₹10,000/month',
    experience: 'Students and freshers',
    description:
      'Join a collaborative product team and help build fast, accessible interfaces used by real customers. You will work with experienced engineers, learn modern frontend practices, and ship improvements from your first week.',
    responsibilities: [
      'Build responsive pages and reusable React components.',
      'Turn product designs into accessible, polished interfaces.',
      'Work with APIs and collaborate with backend engineers.',
      'Test your work and improve performance across devices.',
    ],
    skills: ['HTML', 'CSS', 'JavaScript', 'React', 'Git'],
  },
  {
    id: '2',
    title: 'Backend Developer',
    company: 'CodeCraft Technologies',
    location: 'Bengaluru',
    type: 'Full-time',
    salary: '₹4–6 LPA',
    experience: '0–2 years',
    description:
      'Help design reliable services that power products used by growing teams. You will build APIs, work with data, and partner with frontend and product teammates to deliver secure, maintainable features.',
    responsibilities: [
      'Design, build, and maintain REST APIs and backend services.',
      'Work with databases, data models, and application integrations.',
      'Improve reliability, performance, and security of services.',
      'Review code and contribute to clear technical documentation.',
    ],
    skills: ['Node.js', 'Express.js', 'MongoDB', 'REST APIs', 'Git'],
  },
  {
    id: '3',
    title: 'UI/UX Designer Intern',
    company: 'Creative Minds',
    location: 'Patna',
    type: 'Internship',
    salary: '₹8,000/month',
    experience: 'Students and freshers',
    description:
      'Help shape simple, thoughtful digital experiences. You will learn directly from the design team, explore user needs, and turn ideas into clear flows and prototypes alongside product and engineering.',
    responsibilities: [
      'Create user flows, wireframes, and interactive prototypes.',
      'Support research into customer needs and usability feedback.',
      'Maintain consistent layouts, components, and visual details.',
      'Present design ideas and collaborate with developers.',
    ],
    skills: ['Figma', 'Wireframing', 'Prototyping', 'UI Design', 'Research'],
  },
];
