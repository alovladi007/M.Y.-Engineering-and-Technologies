import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create demo organization
  const demoOrg = await prisma.organization.upsert({
    where: { id: 'demo-org' },
    update: {},
    create: {
      id: 'demo-org',
      name: 'DemoCo Technologies',
      billingPlan: 'PROFESSIONAL',
    },
  });

  console.log('✅ Created organization:', demoOrg.name);

  // Create demo user
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@patentplatform.com' },
    update: {},
    create: {
      email: 'demo@patentplatform.com',
      name: 'Demo User',
      passwordHash: await argon2.hash('demo123456'),
      role: 'USER',
    },
  });

  console.log('✅ Created user:', demoUser.email);

  // Create organization membership
  await prisma.organizationMember.upsert({
    where: {
      userId_orgId: {
        userId: demoUser.id,
        orgId: demoOrg.id,
      },
    },
    update: {},
    create: {
      userId: demoUser.id,
      orgId: demoOrg.id,
      role: 'OWNER',
    },
  });

  // Create demo matter
  const demoMatter = await prisma.matter.upsert({
    where: { id: 'demo-matter' },
    update: {},
    create: {
      id: 'demo-matter',
      title: 'Smart Patent Filing System',
      type: 'NONPROVISIONAL',
      status: 'DRAFT',
      abstract: 'A system and method for automated patent application preparation using artificial intelligence to generate claims, specifications, and USPTO-compliant forms.',
      orgId: demoOrg.id,
      createdById: demoUser.id,
    },
  });

  console.log('✅ Created matter:', demoMatter.title);

  // Create inventors
  await prisma.inventor.create({
    data: {
      firstName: 'John',
      lastName: 'Doe',
      residence: 'San Francisco, CA',
      citizenship: 'US',
      matterId: demoMatter.id,
    },
  });

  await prisma.inventor.create({
    data: {
      firstName: 'Jane',
      lastName: 'Smith',
      residence: 'New York, NY',
      citizenship: 'US',
      matterId: demoMatter.id,
    },
  });

  // Create assignee
  await prisma.assignee.create({
    data: {
      name: 'DemoCo Technologies, Inc.',
      address: '123 Innovation Way, San Francisco, CA 94105',
      entityType: 'LARGE',
      matterId: demoMatter.id,
    },
  });

  // Create sample claims
  const claim1 = await prisma.claim.create({
    data: {
      number: 1,
      text: 'A system for automated patent filing, comprising:\na processor configured to receive invention disclosure information;\nan artificial intelligence engine trained on patent law and configured to generate patent claims based on the invention disclosure information;\na document generator configured to create USPTO-compliant forms based on the generated claims; and\na database storing patent law guidelines and templates.',
      type: 'independent',
      isIndependent: true,
      matterId: demoMatter.id,
    },
  });

  await prisma.claim.create({
    data: {
      number: 2,
      text: 'The system of claim 1, wherein the artificial intelligence engine comprises a large language model fine-tuned on granted patents and patent prosecution histories.',
      type: 'dependent',
      isIndependent: false,
      parentClaimId: claim1.id,
      matterId: demoMatter.id,
    },
  });

  await prisma.claim.create({
    data: {
      number: 3,
      text: 'The system of claim 1, further comprising a prior art search module configured to identify relevant references using vector similarity search.',
      type: 'dependent',
      isIndependent: false,
      parentClaimId: claim1.id,
      matterId: demoMatter.id,
    },
  });

  console.log('✅ Created sample claims');

  // Create specification sections
  await prisma.specSection.create({
    data: {
      kind: 'FIELD',
      markdown: 'The present disclosure relates generally to automated systems for preparing patent applications, and more particularly to artificial intelligence-powered platforms for generating patent claims and specifications.',
      matterId: demoMatter.id,
    },
  });

  await prisma.specSection.create({
    data: {
      kind: 'BACKGROUND',
      markdown: 'Traditional patent application preparation is a time-consuming and complex process requiring extensive legal expertise. Patent attorneys must manually draft claims, write detailed specifications, and ensure compliance with numerous USPTO requirements. This process can take weeks or months and is prone to human error.\n\nExisting tools provide limited automation, typically focusing on form filling or template management. There remains a need for comprehensive automation that can intelligently generate patent content while ensuring legal compliance.',
      matterId: demoMatter.id,
    },
  });

  await prisma.specSection.create({
    data: {
      kind: 'SUMMARY',
      markdown: 'The present disclosure provides a system and method for automated patent filing using artificial intelligence. The system receives invention disclosures and automatically generates patent claims, specifications, and USPTO-compliant forms. An AI engine trained on patent law ensures that generated content meets legal requirements while a prior art search module identifies relevant references.',
      matterId: demoMatter.id,
    },
  });

  console.log('✅ Created specification sections');

  // Create prior art references
  await prisma.priorArtReference.create({
    data: {
      type: 'US',
      citation: 'US Patent No. 10,123,456 - "Automated Legal Document Generation"',
      url: 'https://patents.google.com/patent/US10123456',
      matterId: demoMatter.id,
    },
  });

  await prisma.priorArtReference.create({
    data: {
      type: 'NPL',
      citation: 'Smith et al., "Machine Learning for Patent Analysis," Journal of IP Law, Vol. 45, 2023',
      matterId: demoMatter.id,
    },
  });

  // Create tasks
  await prisma.task.createMany({
    data: [
      {
        title: 'Complete invention disclosure',
        kind: 'INTAKE',
        status: 'DONE',
        matterId: demoMatter.id,
      },
      {
        title: 'Draft independent claims',
        kind: 'DRAFT',
        status: 'IN_PROGRESS',
        matterId: demoMatter.id,
      },
      {
        title: 'Prepare IDS',
        kind: 'IDS',
        status: 'TODO',
        matterId: demoMatter.id,
      },
    ],
  });

  // Create deadlines
  const priorityDate = new Date();
  priorityDate.setMonth(priorityDate.getMonth() + 12);

  await prisma.deadline.create({
    data: {
      kind: 'PRIORITY_12M',
      dueAt: priorityDate,
      notes: '12-month priority deadline for filing',
      matterId: demoMatter.id,
    },
  });

  // Create agent run
  await prisma.agentRun.create({
    data: {
      status: 'SUCCEEDED',
      goals: ['Generate independent claims', 'Create specification outline'],
      output: {
        claims: [
          {
            number: 1,
            text: 'A system for automated patent filing...',
            type: 'independent',
          },
        ],
        notes: ['Claims generated successfully', 'Ready for attorney review'],
      },
      logs: [
        'Analyzing invention disclosure',
        'Generating claims structure',
        'Validating antecedent basis',
        'Complete',
      ],
      tokens: 2500,
      costUSD: 0.075,
      matterId: demoMatter.id,
    },
  });

  console.log('✅ Created sample agent run');

  // Create vector chunks (knowledge base samples)
  await prisma.vectorChunk.createMany({
    data: [
      {
        source: 'MPEP',
        sourceId: '2106',
        text: 'Subject matter eligibility under 35 U.S.C. 101 requires that the claimed invention be directed to one of the four statutory categories: process, machine, manufacture, or composition of matter.',
        metadata: { section: '2106', title: 'Patent Subject Matter Eligibility' },
      },
      {
        source: 'MPEP',
        sourceId: '2173',
        text: 'A claim must particularly point out and distinctly claim the subject matter which the inventor or a joint inventor regards as the invention. The claim language must be clear and definite.',
        metadata: { section: '2173', title: 'Claims Must Be Clear and Definite' },
      },
      {
        source: 'CFR',
        sourceId: '1.75',
        text: 'The specification must conclude with one or more claims particularly pointing out and distinctly claiming the subject matter which the applicant regards as his invention.',
        metadata: { title: '37 CFR 1.75', regulation: 'Claims' },
      },
      {
        source: 'TEMPLATE',
        sourceId: 'ads-template',
        text: 'Application Data Sheet template with fields for applicant information, inventor details, correspondence address, and application information.',
        metadata: { formType: 'ADS', version: 'PTO/AIA/14' },
      },
    ],
  });

  console.log('✅ Created knowledge base samples');

  console.log('🎉 Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });