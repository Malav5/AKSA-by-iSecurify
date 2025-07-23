// src/Policies.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { X, ChevronDown, ChevronRight } from 'lucide-react';
import { jsPDF } from 'jspdf';

const policiesList = [
  {
    category: 'General Security',
    items: [
      'Acceptable Use Policy',
      'Encryption Policy',
      'Logging and Monitoring Policy',
    ],
  },
  {
    category: 'Data Management',
    items: [
      'Data Access and Password Policy',
      'Data Back‑up Policy',
    ],
  },
  {
    category: 'Facility and HR',
    items: [
      'Facility Security Policy',
      'Human Resource Security Policy',
    ],
  },
  {
    category: 'Risk and Incident Management',
    items: [
      'Information Security Risk Assessment Policy',
      'Security Incident Response Policy',
    ],
  },
  {
    category: 'Compliance and Privacy', 
    items: [
      'Privacy Policy – External',
    ],
  },
  {
    category: 'Technical',
    items: [
      'Vulnerability Identification and System Updates Policy',
    ],
  },
  {
    category: 'Telecommuting',
    items: [
      'Telecommuting Policy',
    ],
  },
];

// Placeholder descriptions for demonstration
const policyDescriptions = {
  'Acceptable Use Policy': 'Defines acceptable use of company resources.',
  'Anti‑Virus and Malware Policy': 'Outlines requirements for anti-virus and malware protection.',
  'Asset Management Policy': 'Describes how assets are managed and tracked.',
  'Change Management Policy': 'Details the process for managing changes to systems.',
  'Code of Ethics Policy': 'Sets expectations for ethical behavior.',
  'Corporate Policy Program': 'Overview of the corporate policy framework.',
  'Data Access and Password Policy': 'Details how user passwords and data access are managed.',
  'Data Back‑up Policy': 'Outlines the requirements for data backup procedures.',
  'Data Classification Policy': 'Defines how data is classified and handled.',
  'Data Retention Policy': 'Specifies how long data is kept and for what purposes.',
  'Encryption Policy': 'Describes the encryption standards and procedures.',
  'Facility Security Policy': 'Details security measures for physical facilities.',
  'HR Corrective Action Procedure': 'Details the process for handling HR-related incidents.',
  'Human Resource Security Policy': 'Sets expectations for security in HR processes.',
  'Information Security Committee Policy': 'Details the role and responsibilities of the committee.',
  'Information Security Risk Assessment Policy': 'Outlines the process for conducting risk assessments.',
  'Security Incident Response Policy': 'Details the procedure for responding to security incidents.',
  'Interconnection Agreement Policy': 'Details the terms and conditions for external connections.',
  'Privacy Policy – External': 'Outlines privacy practices for external parties.',
  'Privacy Policy – Internal': 'Details internal privacy policies and procedures.',
  'Service Provider Security Policy': 'Sets expectations for security in service provider relationships.',
  'Logging and Monitoring Policy': 'Details requirements for logging and monitoring systems.',
  'Perimeter Security and Administration Policy': 'Describes security measures for network perimeters.',
  'Software Development Policy': 'Details security requirements for software development.',
  'System Configuration Policy': 'Details the process for configuring systems.',
  'Vulnerability Identification and System Updates Policy': 'Outlines procedures for identifying and remediating vulnerabilities.',
  'Telecommuting Assignment': 'Details the process for assigning telecommuting roles.',
  'Telecommuting Policy': 'Outlines the rules and guidelines for telecommuting.',
  'Telecommuting Self‑Certification Safety Checklist': 'Provides a checklist for telecommuters to self-certify safety.',
  'Policy or Standard Exception Request Form': 'Form for requesting exceptions to policies.',
  'Policy or Standard Exception Request Procedure': 'Procedure for handling exception requests.',
  'Policy or Standard Variance Request Form': 'Form for requesting variances to policies.',
  'Policy or Standard Variance Request Procedure': 'Procedure for handling variance requests.',
};

const pdfTemplates = {
  'Acceptable Use Policy': {
    title: 'Acceptable Use Policy (AUP)',
    subtitle: 'For SOC Dashboard Access — AKSA by iSecurify',
    effectiveDate: '[Insert Date]',
    version: '1.0',
    appliesTo: 'All users with access to the AKSA SOC Dashboard',
    sections: [
      { header: '1. Purpose', body: 'This policy explains what you can and cannot do when using the SOC Dashboard. It helps keep our systems and data safe for everyone.' },
      { header: '2. What You Can Do', bullets: [ 'View and work on security alerts assigned to you.', 'Investigate incidents that you have permission to see.', 'Use the dashboard for your job’s security tasks and monitoring.', 'Report anything unusual or suspicious to the SOC team right away.' ] },
      { header: '3. What You Cannot Do', bullets: [ 'Try to access data or areas you are not allowed to see.', 'Share your dashboard password or leave your session open when you’re away.', 'Download, change, or export sensitive data unless you have permission.', 'Use the dashboard for personal or non-work reasons.', 'Change dashboard settings, rules, or agents unless you are authorized.' ], bulletColor: [231, 76, 60] },
      { header: '4. Your Responsibilities', bullets: [ 'Keep your login details private and secure.', 'Always log out when you finish or leave your computer.', 'Tell the SOC team if you notice anything suspicious or if you think someone broke the rules.', 'Follow all company cybersecurity rules and instructions.' ] },
      { header: '5. Monitoring and Consequences', body: 'Everything you do on the dashboard is recorded and may be checked. If you break these rules, you may lose access, face disciplinary action, or, in serious cases, legal consequences.' },
      { header: '6. Agreement', body: 'By using the SOC Dashboard, you agree to follow these rules and understand that your activity may be monitored for security.' }
    ],
    contact: 'If you have questions, contact: soc-admin@yourdomain.com'
  },
  'Encryption Policy': {
    title: 'Encryption Policy',
    subtitle: 'For SOC Dashboard Data Protection — AKSA by iSecurify',
    effectiveDate: '[Insert Date]',
    version: '1.0',
    appliesTo: 'All users and administrators of the AKSA SOC Dashboard',
    sections: [
      { header: '1. Purpose', body: 'This policy describes how sensitive data must be protected using encryption to prevent unauthorized access.' },
      { header: '2. When Encryption Is Required', bullets: [ 'All sensitive data stored in the dashboard must be encrypted at rest.', 'Data sent between the dashboard and users must be encrypted in transit (e.g., HTTPS).', 'Passwords and authentication tokens must always be encrypted.' ] },
      { header: '3. User Responsibilities', bullets: [ 'Never attempt to bypass or disable encryption features.', 'Report any suspected weaknesses in encryption to the SOC team.', 'Use only approved methods for sharing or exporting data.' ] },
      { header: '4. Enforcement', body: 'Violations of this policy may result in loss of access, disciplinary action, or legal consequences.' }
    ],
    contact: 'For questions, contact: soc-admin@yourdomain.com'
  },
  'Logging and Monitoring Policy': {
    title: 'Logging and Monitoring Policy',
    subtitle: 'For SOC Dashboard Security — AKSA by iSecurify',
    effectiveDate: '[Insert Date]',
    version: '1.0',
    appliesTo: 'All users and administrators of the AKSA SOC Dashboard',
    sections: [
      { header: '1. Purpose', body: 'This policy ensures that all important actions and events on the SOC Dashboard are logged and monitored to detect and respond to security threats.' },
      { header: '2. What Is Logged', bullets: [ 'User logins and logouts.', 'Access to sensitive data or settings.', 'Changes to user permissions or configurations.', 'Security alerts and incident responses.' ] },
      { header: '3. User Responsibilities', bullets: [ 'Do not attempt to disable or tamper with logging features.', 'Report any suspicious activity or missing logs to the SOC team.', 'Understand that your actions may be reviewed for security purposes.' ] },
      { header: '4. Enforcement', body: 'Failure to comply with this policy may result in access loss, disciplinary action, or legal escalation.' }
    ],
    contact: 'For questions, contact: soc-admin@yourdomain.com'
  },
  'Data Access and Password Policy': {
    title: 'Data Access and Password Policy',
    subtitle: 'For SOC Dashboard User Security — AKSA by iSecurify',
    effectiveDate: '[Insert Date]',
    version: '1.0',
    appliesTo: 'All users of the AKSA SOC Dashboard',
    sections: [
      { header: '1. Purpose', body: 'This policy sets requirements for secure access to data and strong password practices.' },
      { header: '2. Access Control', bullets: [ 'Access is granted based on job role and need-to-know.', 'Users must not share their credentials with anyone.', 'Inactive accounts are reviewed and removed regularly.' ] },
      { header: '3. Password Requirements', bullets: [ 'Passwords must be at least 12 characters long.', 'Use a mix of letters, numbers, and symbols.', 'Do not reuse passwords from other accounts.', 'Change your password immediately if you suspect compromise.' ] },
      { header: '4. Enforcement', body: 'Violations may result in access loss, disciplinary action, or legal escalation.' }
    ],
    contact: 'For questions, contact: soc-admin@yourdomain.com'
  },
  'Data Back‑up Policy': {
    title: 'Data Back-up Policy',
    subtitle: 'For SOC Dashboard Data Protection — AKSA by iSecurify',
    effectiveDate: '[Insert Date]',
    version: '1.0',
    appliesTo: 'All administrators of the AKSA SOC Dashboard',
    sections: [
      { header: '1. Purpose', body: 'This policy ensures that all important dashboard data is regularly backed up and can be restored if needed.' },
      { header: '2. Backup Frequency', bullets: [ 'Critical data is backed up daily.', 'Backups are stored securely and tested regularly.', 'Backup copies are protected from unauthorized access.' ] },
      { header: '3. User Responsibilities', bullets: [ 'Do not attempt to disable or alter backup processes.', 'Report any backup failures or issues to the SOC team.' ] },
      { header: '4. Enforcement', body: 'Failure to comply may result in disciplinary action or access loss.' }
    ],
    contact: 'For questions, contact: soc-admin@yourdomain.com'
  },
  'Facility Security Policy': {
    title: 'Facility Security Policy',
    subtitle: 'For Physical Security — AKSA by iSecurify',
    effectiveDate: '[Insert Date]',
    version: '1.0',
    appliesTo: 'All staff and visitors to AKSA facilities',
    sections: [
      { header: '1. Purpose', body: 'This policy protects the physical security of AKSA offices and data centers.' },
      { header: '2. Access Control', bullets: [ 'Only authorized personnel may enter secure areas.', 'Visitors must be escorted at all times.', 'Access cards or keys must not be shared.' ] },
      { header: '3. Incident Reporting', bullets: [ 'Report lost access cards or suspicious activity immediately.', 'Follow emergency procedures as posted.' ] },
      { header: '4. Enforcement', body: 'Violations may result in loss of access or disciplinary action.' }
    ],
    contact: 'For questions, contact: soc-admin@yourdomain.com'
  },
  'Human Resource Security Policy': {
    title: 'Human Resource Security Policy',
    subtitle: 'For Personnel Security — AKSA by iSecurify',
    effectiveDate: '[Insert Date]',
    version: '1.0',
    appliesTo: 'All employees, contractors, and temporary staff',
    sections: [
      { header: '1. Purpose', body: 'This policy ensures that all personnel understand their security responsibilities.' },
      { header: '2. Onboarding', bullets: [ 'All new staff receive security training.', 'Background checks are performed as required by law.' ] },
      { header: '3. Ongoing Responsibilities', bullets: [ 'Follow all security policies and report violations.', 'Participate in regular security awareness training.' ] },
      { header: '4. Offboarding', bullets: [ 'Return all company property and access cards.', 'Access is revoked immediately upon departure.' ] },
      { header: '5. Enforcement', body: 'Non-compliance may result in disciplinary action or legal escalation.' }
    ],
    contact: 'For questions, contact: soc-admin@yourdomain.com'
  },
  'Information Security Risk Assessment Policy': {
    title: 'Information Security Risk Assessment Policy',
    subtitle: 'For Risk Management — AKSA by iSecurify',
    effectiveDate: '[Insert Date]',
    version: '1.0',
    appliesTo: 'All departments and teams',
    sections: [
      { header: '1. Purpose', body: 'This policy ensures that security risks are identified, assessed, and managed.' },
      { header: '2. Risk Assessment', bullets: [ 'Risks are reviewed at least annually.', 'Assessments include technical, physical, and administrative risks.', 'Mitigation plans are documented and tracked.' ] },
      { header: '3. User Responsibilities', bullets: [ 'Participate in risk assessments as required.', 'Report new or emerging risks to the SOC team.' ] },
      { header: '4. Enforcement', body: 'Failure to comply may result in disciplinary action.' }
    ],
    contact: 'For questions, contact: soc-admin@yourdomain.com'
  },
  'Security Incident Response Policy': {
    title: 'Security Incident Response Policy',
    subtitle: 'For Incident Management — AKSA by iSecurify',
    effectiveDate: '[Insert Date]',
    version: '1.0',
    appliesTo: 'All users and administrators',
    sections: [
      { header: '1. Purpose', body: 'This policy ensures that all security incidents are reported, managed, and resolved quickly.' },
      { header: '2. Reporting Incidents', bullets: [ 'Report all suspected incidents to the SOC team immediately.', 'Do not attempt to investigate or resolve incidents on your own.' ] },
      { header: '3. Response Process', bullets: [ 'The SOC team will assess, contain, and resolve incidents.', 'Users must cooperate with investigations.' ] },
      { header: '4. Enforcement', body: 'Failure to report or cooperate may result in disciplinary action.' }
    ],
    contact: 'For questions, contact: soc-admin@yourdomain.com'
  },
  'Privacy Policy – External': {
    title: 'Privacy Policy – External',
    subtitle: 'For External Users — AKSA by iSecurify',
    effectiveDate: '[Insert Date]',
    version: '1.0',
    appliesTo: 'All external users and partners',
    sections: [
      { header: '1. Purpose', body: 'This policy explains how AKSA collects, uses, and protects personal data of external users.' },
      { header: '2. Data Collection', bullets: [ 'Only necessary data is collected for service delivery.', 'Users are informed about data collection practices.' ] },
      { header: '3. Data Protection', bullets: [ 'Personal data is protected using industry best practices.', 'Data is not shared with third parties without consent.' ] },
      { header: '4. User Rights', bullets: [ 'Users may request access, correction, or deletion of their data.' ] },
      { header: '5. Enforcement', body: 'Violations may result in access loss or legal action.' }
    ],
    contact: 'For privacy questions, contact: privacy@yourdomain.com'
  },
  'Vulnerability Identification and System Updates Policy': {
    title: 'Vulnerability Identification and System Updates Policy',
    subtitle: 'For System Security — AKSA by iSecurify',
    effectiveDate: '[Insert Date]',
    version: '1.0',
    appliesTo: 'All administrators and IT staff',
    sections: [
      { header: '1. Purpose', body: 'This policy ensures that vulnerabilities are identified and fixed quickly to protect systems.' },
      { header: '2. Identification', bullets: [ 'Regularly scan systems for vulnerabilities.', 'Monitor security advisories and alerts.' ] },
      { header: '3. Updates', bullets: [ 'Apply security updates and patches promptly.', 'Test updates before deployment when possible.' ] },
      { header: '4. User Responsibilities', bullets: [ 'Report any suspected vulnerabilities to the SOC team.' ] },
      { header: '5. Enforcement', body: 'Failure to comply may result in disciplinary action or access loss.' }
    ],
    contact: 'For questions, contact: soc-admin@yourdomain.com'
  },
  'Telecommuting Policy': {
    title: 'Telecommuting Policy',
    subtitle: 'For Remote Work — AKSA by iSecurify',
    effectiveDate: '[Insert Date]',
    version: '1.0',
    appliesTo: 'All remote workers and managers',
    sections: [
      { header: '1. Purpose', body: 'This policy sets expectations for secure and productive remote work.' },
      { header: '2. Security Requirements', bullets: [ 'Use only company-approved devices and software.', 'Keep all work data secure and do not share with unauthorized persons.', 'Report lost or stolen devices immediately.' ] },
      { header: '3. Communication', bullets: [ 'Stay in regular contact with your team and manager.', 'Attend all required meetings and check-ins.' ] },
      { header: '4. Workspace', bullets: [ 'Maintain a safe and private workspace.', 'Follow all company safety and security guidelines.' ] },
      { header: '5. Enforcement', body: 'Non-compliance may result in loss of remote work privileges or disciplinary action.' }
    ],
    contact: 'For questions, contact: soc-admin@yourdomain.com'
  }
};

function renderPolicyPDF(doc, policyObj) {
  // Header: Two-tone with logo (if available)
  doc.setFillColor(41, 128, 185); // blue left
  doc.rect(0, 0, 60, 30, 'F');
  doc.setFillColor(52, 152, 219); // lighter blue right
  doc.rect(60, 0, 150, 30, 'F');

  // Logo (optional, if you have a logo in base64 or as a file, you can add it here)
  // doc.addImage('logo_base64_or_url', 'PNG', 8, 6, 18, 18);

  // Title and subtitle
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(policyObj.title, 75, 14, { align: 'left' });
  doc.setFontSize(11);
  doc.text(policyObj.subtitle, 75, 22, { align: 'left' });

  // Divider
  doc.setDrawColor(41, 128, 185);
  doc.setLineWidth(1);
  doc.line(10, 33, 200, 33);

  // Policy meta
  doc.setTextColor(44, 62, 80);
  doc.setFont('helvetica', 'normal');
  let y = 40;
  doc.setFontSize(10);
  doc.text(`Effective Date: ${policyObj.effectiveDate}`, 10, y);
  doc.text(`Version: ${policyObj.version}`, 150, y);
  y += 6;
  doc.text(`Applies To: ${policyObj.appliesTo}`, 10, y);
  y += 10;

  // Sections
  let sectionNum = 1;
  policyObj.sections.forEach(section => {
    // Section header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(41, 128, 185);
    doc.text(`${sectionNum}. ${section.header.replace(/^\d+\.\s*/, '')}`, 10, y);
    y += 7;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(44, 62, 80);
    if (section.body) {
      const splitBody = doc.splitTextToSize(section.body, 185);
      doc.text(splitBody, 12, y);
      y += splitBody.length * 6 + 2;
    }
    if (section.bullets) {
      section.bullets.forEach(item => {
        if (section.bulletColor) {
          doc.setFillColor(...section.bulletColor);
        } else {
          doc.setFillColor(41, 128, 185);
        }
        // Modern bullet: colored rounded rectangle
        doc.roundedRect(12, y - 3.5, 3, 3, 1, 1, 'F');
        doc.setTextColor(44, 62, 80);
        const splitItem = doc.splitTextToSize(item, 170);
        doc.text(splitItem, 18, y);
        y += splitItem.length * 6;
      });
      y += 2;
    }
    sectionNum++;
  });
  y += 2;
  // Contact info
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(10);
  doc.setTextColor(41, 128, 185);
  doc.text(policyObj.contact, 10, y);
}

const handleDownloadPDF = (policy) => {
  const doc = new jsPDF();
  if (pdfTemplates[policy]) {
    renderPolicyPDF(doc, pdfTemplates[policy]);
    doc.save(`${policy.replace(/\s+/g, '_')}.pdf`);
  } else {
    doc.setFontSize(18);
    doc.text(policy, 10, 20);
    doc.setFontSize(12);
    doc.text(policyDescriptions[policy] || 'No description available.', 10, 40, { maxWidth: 180 });
    doc.save(`${policy.replace(/\s+/g, '_')}.pdf`);
  }
};

const Policies = () => {
  const [policies, setPolicies] = useState([]);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    setPolicies(policiesList); // simulate API fetch
    setExpanded(
      Object.fromEntries(policiesList.map((section) => [section.category, true]))
    );
  }, []);

  const filteredPolicies = policies
    .map((section) => ({
      ...section,
      items: section.items.filter((policy) =>
        policy.toLowerCase().includes(search.toLowerCase())
      ),
    }))
    .filter((section) => section.items.length > 0);

  const handleToggle = (category) => {
    setExpanded((prev) => ({ ...prev, [category]: !prev[category] }));
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="sticky top-0 h-screen">
        <Sidebar />
      </aside>

      <div className="flex-1 flex flex-col relative">
        <header className="sticky top-0 z-10">
          <Header />
        </header>

        {/* Close Button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 right-6 z-20 text-gray-500 hover:text-red-600"
          title="Close"
        >
          <X className="w-6 h-6" />
        </button>

        <main className="flex-1 p-8 overflow-y-auto bg-gray-50">
          <h1 className="text-3xl font-bold mb-6">Cybersecurity Policies Library</h1>
          <p className="mb-8 text-gray-700">
            Choose from our library of professionally crafted policy templates. Click a policy to download it as a PDF.
          </p>

          {/* Search Bar */}
          <div className="mb-8 max-w-md">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for a policy..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              aria-label="Search policies"
            />
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filteredPolicies.length === 0 && (
              <div className="col-span-full text-center text-gray-500">No policies found.</div>
            )}
            {filteredPolicies.map((section) => (
              <div key={section.category} className="bg-white rounded-lg shadow-md p-6">
                <button
                  className="flex items-center w-full text-xl font-semibold mb-4 focus:outline-none hover:text-blue-700"
                  onClick={() => handleToggle(section.category)}
                  aria-expanded={expanded[section.category]}
                  aria-controls={`section-${section.category}`}
                >
                  {expanded[section.category] ? (
                    <ChevronDown className="w-5 h-5 mr-2" />
                  ) : (
                    <ChevronRight className="w-5 h-5 mr-2" />
                  )}
                  {section.category}
                </button>
                <ul
                  id={`section-${section.category}`}
                  className={`space-y-2 transition-all duration-200 ${expanded[section.category] ? 'max-h-96' : 'max-h-0 overflow-hidden'}`}
                >
                  {section.items.map((policy) => (
                    <li key={policy}>
                      <button
                        className="w-full text-left text-blue-600 hover:underline focus:outline-none focus:text-blue-800"
                        onClick={() => handleDownloadPDF(policy)}
                        tabIndex={expanded[section.category] ? 0 : -1}
                        aria-label={`Download ${policy} as PDF`}
                      >
                        {policy}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Policies;
