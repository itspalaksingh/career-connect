export type JobListing = {
  id?: string;
  _id?: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary?: string;
  salaryMin?: number;
  salaryMax?: number;
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
  source?: 'live' | 'sample';
  sourceMessage?: string;
};

export function getJobId(job: JobListing) {
  return job._id ?? job.id ?? '';
}

export async function searchJobs(params: URLSearchParams): Promise<JobSearchResponse> {
  let sourceMessage = 'Live jobs are temporarily unavailable. Showing sample opportunities.';

  try {
    const response = await fetch(`/api/jobs?${params.toString()}`);
    if (!response.ok) throw new Error('Jobs API unavailable');

    const data = await response.json() as JobSearchResponse;
    if (Array.isArray(data.jobs) && data.jobs.length > 0) return { ...data, source: 'live' };
    if (Array.isArray(data.jobs)) {
      sourceMessage = 'No live jobs have been posted yet. Showing sample opportunities.';
    }
  } catch {
    // Keep job discovery usable while the API or database is starting up.
  }

  const includes = (value: string | undefined, query: string) =>
    !query || Boolean(value?.toLocaleLowerCase().includes(query.toLocaleLowerCase()));
  const keyword = params.get('keyword')?.trim() || '';
  const location = params.get('location')?.trim() || '';
  const type = params.get('type') || '';
  const workMode = params.get('workMode') || '';
  const experienceLevel = params.get('experienceLevel') || '';
  const minimum = Number(params.get('minSalary')) || 0;
  const maximum = Number(params.get('maxSalary')) || 0;
  const filtered = jobs.filter((job) => {
    const searchText = [job.title, job.company, job.description, job.location, ...(job.skills || [])].join(' ');
    if (!includes(searchText, keyword) || !includes(job.location, location)) return false;
    if (type && job.type !== type) return false;
    if (workMode && job.workMode !== workMode) return false;
    if (experienceLevel && job.experienceLevel !== experienceLevel) return false;
    if (minimum && (!job.salaryMax || job.salaryMax < minimum)) return false;
    if (maximum && (!job.salaryMin || job.salaryMin > maximum)) return false;
    return true;
  });

  const page = Math.max(1, Number(params.get('page')) || 1);
  const limit = Math.min(30, Math.max(1, Number(params.get('limit')) || 9));
  return {
    jobs: filtered.slice((page - 1) * limit, page * limit),
    total: filtered.length,
    page,
    pages: Math.max(1, Math.ceil(filtered.length / limit)),
    source: 'sample',
    sourceMessage,
  };
}

export const jobs: JobListing[] = [
  {
    id: '1',
    title: 'Frontend Developer Intern',
    company: 'TechNova Solutions',
    location: 'Remote',
    type: 'Internship',
    salary: '₹10,000/month',
    salaryMin: 120000,
    salaryMax: 120000,
    workMode: 'Remote',
    experienceLevel: 'Entry-level',
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
    salaryMin: 400000,
    salaryMax: 600000,
    workMode: 'Hybrid',
    experienceLevel: 'Entry-level',
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
    salaryMin: 96000,
    salaryMax: 96000,
    workMode: 'On-site',
    experienceLevel: 'Entry-level',
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
