import { 
  createFileUploadComponent, 
  createSubmissionHandler, 
  generateSuccessMessage,
  getCurrentAccessId,
  getFileInfo
} from './ticket-flow-utils';

/**
 * Creates the enhanced general help ticket flow with ProForma field support
 *
 * @param {Object} params Configuration
 * @param {Object} params.ticketForm Form state for help tickets
 * @param {Function} params.setTicketForm Function to update ticket form
 * @returns {Object} Enhanced general help flow configuration
 */
export const createGeneralHelpFlow = ({ ticketForm = {}, setTicketForm = () => {} }) => {
  const { submitTicket, getSubmissionResult } = createSubmissionHandler(setTicketForm);
  const fileUploadElement = createFileUploadComponent(setTicketForm, ticketForm);

  return {
    // FORM flow - Enhanced General Help Ticket Form Flow
    general_help_summary_subject: {
      message: "Provide a short title for your ticket.",
      function: (chatState) => setTicketForm({...ticketForm, summary: chatState.userInput}),
      path: "general_help_category"
    },
    general_help_category: {
      message: "What type of issue are you experiencing?",
      options: [
        "User Account Question",
        "Allocation Question",
        "User Support Question",
        "CSSN/CCEP Question",
        "Training Question",
        "Metrics Question",
        "OnDemand Question",
        "Pegasus Question",
        "XDMoD Question",
        "Some Other Question"
      ],
      chatDisabled: true,
      function: (chatState) => setTicketForm({...ticketForm, category: chatState.userInput}),
      path: "general_help_description"
    },
    general_help_description: {
      message: "Please describe your issue.",
      function: (chatState) => setTicketForm({...ticketForm, description: chatState.userInput}),
      path: "general_help_attachment"
    },
    general_help_attachment: {
      message: "Would you like to attach a file to your ticket?",
      options: ["Yes", "No"],
      chatDisabled: true,
      function: (chatState) => setTicketForm({...ticketForm, wantsAttachment: chatState.userInput}),
      path: (chatState) => chatState.userInput === "Yes"
        ? "general_help_upload"
        : "general_help_resource"
    },
    general_help_upload: {
      message: "Please upload your file.",
      component: fileUploadElement,
      options: ["Continue"],
      chatDisabled: true,
      function: () => setTicketForm({...ticketForm, uploadConfirmed: true}),
      path: "general_help_resource"
    },
    general_help_resource: {
      message: "Does your problem involve an ACCESS Resource?",
      options: ["Yes", "No"],
      chatDisabled: true,
      function: (chatState) => setTicketForm({...ticketForm, involvesResource: chatState.userInput.toLowerCase()}),
      path: (chatState) => chatState.userInput === "Yes"
        ? "general_help_resource_details"
        : "general_help_keywords"
    },
    general_help_resource_details: {
      message: "Please select the ACCESS Resource involved with your issue:",
      options: [
        "ACES",
        "Anvil",
        "Bridges-2",
        "DARWIN",
        "Delta",
        "DeltaAI",
        "Derecho",
        "Expanse",
        "FASTER",
        "Granite",
        "Jetstream2",
        "KyRIC",
        "Launch",
        "Neocortex",
        "Ookami",
        "Open Science Grid",
        "Open Storage Network",
        "Ranch",
        "Stampede3"
      ],
      chatDisabled: true,
      function: (chatState) => setTicketForm({...ticketForm, resourceDetails: chatState.userInput}),
      path: "general_help_user_id_at_resource"
    },
    // NEW: Collect User ID at Resource (ProForma field)
    general_help_user_id_at_resource: {
      message: "What is your User ID at the selected resource(s)? (Optional - leave blank if not applicable)",
      function: (chatState) => setTicketForm({...ticketForm, userIdAtResource: chatState.userInput}),
      path: "general_help_keywords"
    },
    general_help_keywords: {
      message: "Please add up to 5 keywords to help route your ticket.",
      checkboxes: {
        items: [
          " C, C++",
          "Abaqus",
          "ACCESS",
          "ACCESS-credits",
          "ACCESS-website",
          "Accounts",
          "ACLS",
          "Adding users",
          "Affiliations",
          "Affinity Groups",
          "AI",
          "Algorithms",
          "Allocation extension",
          "Allocation Management",
          "Allocation proposal",
          "Allocation Time",
          "Allocation users",
          "AMBER",
          "AMIE",
          "Anaconda",
          "Analysis",
          "API",
          "Application Status",
          "ARCGIS",
          "Architecture",
          "Archiving",
          "Astrophysics",
          "ATLAS",
          "Authentication",
          "AWS",
          "AZURE",
          "Backup",
          "BASH",
          "Batch Jobs",
          "Benchmarking",
          "Big Data",
          "Bioinformatics",
          "Biology",
          "Ceph",
          "CFD",
          "cgroups",
          "CHARMM",
          "Checkpoint",
          "cilogon",
          "citation",
          "Cloud",
          "Cloud Computing",
          "Cloud Lab",
          "Cloud Storage",
          "Cluster Management",
          "Cluster Support",
          "CMMC",
          "Community Outreach",
          "Compiling",
          "Composible Systems",
          "Computataional Chemistry",
          "COMSOL",
          "Conda",
          "Condo",
          "Containers",
          "Core dump",
          "Core hours",
          "CP2K",
          "CPU architecture",
          "CPU bound",
          "CUDA",
          "Cybersecurity",
          "CYVERSE",
          "Data",
          "Data Storage",
          "Data-access-protocols",
          "Data-analysis",
          "Data-compliance",
          "Data-lifecycle",
          "Data-management",
          "Data-management-software",
          "Data-provenance",
          "Data-reproducibility",
          "Data-retention",
          "Data-science",
          "Data-sharing",
          "Data-transfer",
          "Data-wrangling",
          "Database-update",
          "Debugging",
          "Debugging, Optimizatio and Profiling",
          "Deep-learning",
          "Dependencies",
          "Deployment",
          "DFT",
          "Distributed-computing",
          "DNS",
          "Docker",
          "Documentation",
          "DOI",
          "DTN",
          "Easybuild",
          "Email",
          "Encryption",
          "Environment-modules",
          "Errors",
          "Extension",
          "FastX",
          "Federated-authentication",
          "File transfers",
          "File-formats",
          "File-limits",
          "File-systems",
          "File-transfer",
          "Finite-element-analysis",
          "Firewall",
          "Fortran",
          "Frameworks and IDE's",
          "GAMESS",
          "Gateways",
          "GATK",
          "Gaussian",
          "GCC",
          "Genomics",
          "GIS",
          "Git",
          "Globus",
          "GPFS",
          "GPU",
          "Gravitational-waves",
          "Gridengine",
          "GROMACS",
          "Hadoop",
          "Hardware",
          "Image-processing",
          "Infiniband",
          "Interactive-mode",
          "Interconnect",
          "IO-Issue",
          "ISILON",
          "Java",
          "Jekyll",
          "Jetstream",
          "Job-accounting",
          "Job-array",
          "Job-charging",
          "Job-failure",
          "Job-sizing",
          "Job-submission",
          "Julia",
          "Jupyterhub",
          "Key-management",
          "Kubernetes",
          "KyRIC",
          "LAMMPS",
          "Library-paths",
          "License",
          "Linear-programming",
          "Linux",
          "LMOD",
          "login",
          "LSF",
          "Lustre",
          "Machine-learning",
          "Management",
          "Materials-science",
          "Mathematica",
          "MATLAB",
          "Memory",
          "Metadata",
          "Modules",
          "Molecular-dynamics",
          "Monte-carlo",
          "MPI",
          "NAMD",
          "NetCDF",
          "Networking",
          "Neural-networks",
          "NFS",
          "NLP",
          "NoMachine",
          "Nvidia",
          "Oceanography",
          "OnDemnad",
          "Open-science-grid",
          "Open-storage-network",
          "OpenCV",
          "Openfoam",
          "OpenMP",
          "OpenMPI",
          "OpenSHIFT",
          "Openstack",
          "Optimization",
          "OS",
          "OSG",
          "Parallelization",
          "Parameter-sweeps",
          "Paraview",
          "Particle-physics",
          "password",
          "PBS",
          "Pegasus",
          "Pending-jobs",
          "Performance-tuning",
          "Permissions",
          "Physiology",
          "PIP",
          "PODMAN",
          "Portals",
          "Pre-emption",
          "Professional and Workforce Development",
          "Professional-development",
          "Profile",
          "Profiling",
          "Programming",
          "Programming Languages",
          "Programming-best-practices",
          "Project-management",
          "Project-renewal",
          "Provisioning",
          "Pthreads",
          "Publication-database",
          "Putty",
          "Python",
          "Pytorch",
          "Quantum-computing",
          "Quantum-mechanics",
          "Quota",
          "R",
          "RDP",
          "React",
          "Reporting",
          "Research-facilitation",
          "Research-grants",
          "Resources",
          "Rstudio-server",
          "S3",
          "Samba",
          "SAS",
          "Scaling",
          "Schedulers",
          "Scheduling",
          "Science DMZ",
          "Science Gateways",
          "Scikit-learn",
          "Scratch",
          "screen",
          "scripting",
          "SDN",
          "Secure Computing and Data",
          "Secure-data-architecture",
          "Serverless-hpc",
          "setup",
          "sftp",
          "SGE",
          "Shell Scripting",
          "Shifter",
          "Singularity",
          "SLURM",
          "SMB",
          "Smrtanalysis",
          "Software Installations",
          "Software-carpentry",
          "SPACK",
          "SPARK",
          "Spectrum-scale",
          "SPSS",
          "SQL",
          "SSH",
          "Stampede2",
          "STATA",
          "Storage",
          "Supplement",
          "Support",
          "TCP",
          "Technical-training-for-hpc",
          "Tensorflow",
          "Terminal-emulation-and-window-management",
          "Tickets",
          "Timing-issue",
          "TMUX",
          "Tools",
          "Training",
          "Transfer SUs",
          "Trinity",
          "Tuning",
          "Unix-environment",
          "Upgrading",
          "Vectorization",
          "Version-control",
          "vim",
          "VNC",
          "VPN",
          "Workflow",
          "Workforce-development",
          "X11",
          "Xalt",
          "XDMoD",
          "XML",
          "XSEDE",
          "I don't see a relevant keyword"
        ],
        min: 0,
        max: 5
      },
      chatDisabled: true,
      function: (chatState) => setTicketForm({...ticketForm, keywords: chatState.userInput}),
      path: (chatState) => {
        if (chatState.userInput && chatState.userInput.includes("I don't see a relevant keyword")) {
          return "general_help_additional_keywords";
        } else {
          return "general_help_priority";
        }
      }
    },
    general_help_additional_keywords: {
      message: "Please enter additional keywords, separated by commas:",
      function: (chatState) => {
        // Get the current keywords selected from checkboxes
        const currentKeywords = ticketForm.keywords || [];
        const additionalKeywords = chatState.userInput;

        // Ensure we're working with arrays for consistency
        const keywordsArray = Array.isArray(currentKeywords)
          ? [...currentKeywords]
          : currentKeywords.split(',').map(k => k.trim());

        // Filter out "I don't see a relevant keyword" from the keywords
        const filteredKeywords = keywordsArray.filter(k => k !== "I don't see a relevant keyword");

        // Add the additional keywords - this will map to suggestedKeyword ProForma field
        const formattedKeywords = Array.isArray(filteredKeywords) && filteredKeywords.length > 0
          ? [...filteredKeywords, additionalKeywords].join(", ")
          : additionalKeywords;

        setTicketForm({
          ...ticketForm,
          keywords: formattedKeywords,
          suggestedKeyword: additionalKeywords // NEW: Store separately for ProForma mapping
        });
      },
      path: "general_help_priority"
    },
    general_help_priority: {
      message: "Please select a priority for your issue:",
      options: ["Lowest", "Low", "Medium", "High", "Highest"],
      chatDisabled: true,
      function: (chatState) => setTicketForm({...ticketForm, priority: chatState.userInput.toLowerCase()}),
      path: "general_help_email"
    },
    general_help_email: {
      message: "What is your email address?",
      function: (chatState) => setTicketForm({...ticketForm, email: chatState.userInput}),
      path: "general_help_name"
    },
    general_help_name: {
      message: "What is your name?",
      function: (chatState) => setTicketForm({...ticketForm, name: chatState.userInput}),
      path: "general_help_accessid"
    },
    general_help_accessid: {
      message: "What is your ACCESS ID?",
      function: (chatState) => {
        setTicketForm({...ticketForm, accessId: chatState.userInput});
      },
      path: (chatState) => {
        // Add small delay to let React update state
        setTimeout(() => {}, 100);
        return "general_help_ticket_summary";
      }
    },
    general_help_ticket_summary: {
      message: (chatState) => {
        const currentAccessId = getCurrentAccessId(chatState, ticketForm, 'general_help_accessid');
        const fileInfo = getFileInfo(ticketForm.uploadedFiles);

        let resourceInfo = '';
        if (ticketForm.involvesResource === 'yes') {
          resourceInfo = `\nResource: ${ticketForm.resourceDetails || 'Not specified'}`;
          if (ticketForm.userIdAtResource) {
            resourceInfo += `\nUser ID at Resource: ${ticketForm.userIdAtResource}`;
          }
        }

        return `Thank you for providing your issue details. Here's a summary:\n\n` +
               `Name: ${ticketForm.name || 'Not provided'}\n` +
               `Email: ${ticketForm.email || 'Not provided'}\n` +
               `ACCESS ID: ${currentAccessId}\n` +
               `Issue Summary: ${ticketForm.summary || 'Not provided'}\n` +
               `Category: ${ticketForm.category || 'Not provided'}\n` +
               `Priority: ${ticketForm.priority || 'Not provided'}\n` +
               `Keywords: ${ticketForm.keywords || 'Not provided'}\n` +
               `Issue Description: ${ticketForm.description || 'Not provided'}${resourceInfo}${fileInfo}\n\n` +
               `Would you like to submit this ticket?`;
      },
      options: ["Submit Ticket", "Back to Main Menu"],
      chatDisabled: true,
      function: async (chatState) => {
        if (chatState.userInput === "Submit Ticket") {
          const formData = {
            // Regular JSM fields
            email: ticketForm.email || "",
            summary: ticketForm.summary || "General Support Ticket",
            description: ticketForm.description || "",
            priority: ticketForm.priority || "medium",
            accessId: ticketForm.accessId || "",
            userName: ticketForm.name || "",
            issueType: ticketForm.category || "",
            // ProForma fields for request type 17
            hasResourceProblem: ticketForm.involvesResource === 'yes' ? 'Yes' : 'No',
            userIdAtResource: ticketForm.userIdAtResource || "",
            resourceName: ticketForm.resourceDetails || "",
            keywords: ticketForm.keywords || "",
            noRelevantKeyword: ticketForm.suggestedKeyword ? 'checked' : '',
            suggestedKeyword: ticketForm.suggestedKeyword || ""
          };

          await submitTicket(formData, 'support', ticketForm.uploadedFiles || []);
        }
      },
      path: "general_help_success"
    },
    general_help_success: {
      message: () => {
        return generateSuccessMessage(getSubmissionResult(), 'support ticket');
      },
      options: ["Back to Main Menu"],
      chatDisabled: true,
      renderHtml: ["BOT"],
      path: "start"
    }
  };
};