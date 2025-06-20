import { 
  createFileUploadComponent, 
  createSubmissionHandler, 
  generateSuccessMessage,
  getFileInfo
} from './ticket-flow-utils';
import { getCurrentTicketForm, getCurrentFormWithUserInfo } from '../../flow-context-utils';

/**
 * Creates the enhanced general help ticket flow with ProForma field support
 *
 * @param {Object} params Configuration
 * @param {Object} params.ticketForm Form state for help tickets
 * @param {Function} params.setTicketForm Function to update ticket form
 * @returns {Object} Enhanced general help flow configuration
 */
export const createGeneralHelpFlow = ({ ticketForm = {}, setTicketForm = () => {}, userInfo = {} }) => {
  const { submitTicket, getSubmissionResult } = createSubmissionHandler(setTicketForm);
  const fileUploadElement = createFileUploadComponent(setTicketForm, ticketForm);


  return {
    // FORM flow - Enhanced General Help Ticket Form Flow
    general_help_summary_subject: {
      message: "Provide a short title for your ticket.",
      function: (chatState) => {
        // Pre-populate form with user info on first step
        const currentForm = getCurrentTicketForm();
        const updatedForm = {
          ...currentForm,
          summary: chatState.userInput,
          email: userInfo.email || currentForm.email,
          name: userInfo.name || currentForm.name,
          accessId: userInfo.username || currentForm.accessId
        };
        setTicketForm(updatedForm);
      },
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
      function: (chatState) => {
        const currentForm = getCurrentTicketForm();
        setTicketForm({...currentForm, category: chatState.userInput});
      },
      path: "general_help_description"
    },
    general_help_description: {
      message: "Please describe your issue.",
      function: (chatState) => {
        const currentForm = getCurrentTicketForm();
        setTicketForm({...currentForm, description: chatState.userInput});
      },
      path: "general_help_attachment"
    },
    general_help_attachment: {
      message: "Would you like to attach a file to your ticket?",
      options: ["Yes", "No"],
      chatDisabled: true,
      function: (chatState) => {
        const currentForm = getCurrentTicketForm();
        setTicketForm({...currentForm, wantsAttachment: chatState.userInput});
      },
      path: (chatState) => chatState.userInput === "Yes"
        ? "general_help_upload"
        : "general_help_resource"
    },
    general_help_upload: {
      message: "Please upload your file.",
      component: fileUploadElement,
      options: ["Continue"],
      chatDisabled: true,
      function: () => {
        const currentForm = getCurrentTicketForm();
        setTicketForm({...currentForm, uploadConfirmed: true});
      },
      path: "general_help_resource"
    },
    general_help_resource: {
      message: "Does your problem involve an ACCESS Resource?",
      options: ["Yes", "No"],
      chatDisabled: true,
      function: (chatState) => {
        const currentForm = getCurrentTicketForm();
        setTicketForm({...currentForm, involvesResource: chatState.userInput.toLowerCase()});
      },
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
      function: (chatState) => {
        const currentForm = getCurrentTicketForm();
        setTicketForm({...currentForm, resourceDetails: chatState.userInput});
      },
      path: "general_help_user_id_at_resource"
    },
    // NEW: Collect User ID at Resource (ProForma field)
    general_help_user_id_at_resource: {
      message: "What is your User ID at the selected resource(s)? (Optional - leave blank if not applicable)",
      function: (chatState) => {
        const currentForm = getCurrentTicketForm();
        setTicketForm({...currentForm, userIdAtResource: chatState.userInput});
      },
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
      function: (chatState) => {
        const currentForm = getCurrentTicketForm();
        setTicketForm({...currentForm, keywords: chatState.userInput});
      },
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
        const currentForm = getCurrentTicketForm();
        const currentKeywords = currentForm.keywords || [];
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
          ...currentForm,
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
      function: (chatState) => {
        const currentForm = getCurrentTicketForm();
        setTicketForm({...currentForm, priority: chatState.userInput.toLowerCase()});
      },
      path: (chatState) => {
        if (!userInfo.email) return "general_help_email";
        if (!userInfo.name) return "general_help_name";
        if (!userInfo.username) return "general_help_accessid";
        return "general_help_ticket_summary";
      }
    },
    general_help_email: {
      message: "What is your email address?",
      function: (chatState) => {
        const currentForm = getCurrentTicketForm();
        setTicketForm({...currentForm, email: chatState.userInput});
      },
      path: (chatState) => {
        if (!userInfo.name) return "general_help_name";
        if (!userInfo.username) return "general_help_accessid";
        return "general_help_ticket_summary";
      }
    },
    general_help_name: {
      message: "What is your name?",
      function: (chatState) => {
        const currentForm = getCurrentTicketForm();
        setTicketForm({...currentForm, name: chatState.userInput});
      },
      path: (chatState) => {
        if (!userInfo.username) return "general_help_accessid";
        return "general_help_ticket_summary";
      }
    },
    general_help_accessid: {
      message: "What is your ACCESS ID?",
      function: (chatState) => {
        const currentForm = getCurrentTicketForm();
        setTicketForm({...currentForm, accessId: chatState.userInput});
      },
      path: (chatState) => {
        // Add small delay to let React update state
        setTimeout(() => {}, 100);
        return "general_help_ticket_summary";
      }
    },
    general_help_ticket_summary: {
      message: (chatState) => {
        // Get current form state from context (always up-to-date)
        const currentForm = getCurrentTicketForm();
        const formWithUserInfo = getCurrentFormWithUserInfo(userInfo);
        
        // Use current form state directly since Form Context always has fresh data
        const fileInfo = getFileInfo(currentForm.uploadedFiles);

        let resourceInfo = '';
        if (currentForm.involvesResource === 'yes') {
          resourceInfo = `\nResource: ${currentForm.resourceDetails || 'Not specified'}`;
          if (currentForm.userIdAtResource) {
            resourceInfo += `\nUser ID at Resource: ${currentForm.userIdAtResource}`;
          }
        }

        return `Thank you for providing your issue details. Here's a summary:\n\n` +
               `Name: ${formWithUserInfo.name || 'Not provided'}\n` +
               `Email: ${formWithUserInfo.email || 'Not provided'}\n` +
               `ACCESS ID: ${formWithUserInfo.accessId || 'Not provided'}\n` +
               `Issue Summary: ${currentForm.summary || 'Not provided'}\n` +
               `Category: ${currentForm.category || 'Not provided'}\n` +
               `Priority: ${currentForm.priority || 'Not provided'}\n` +
               `Keywords: ${currentForm.keywords || 'Not provided'}\n` +
               `Issue Description: ${currentForm.description || 'Not provided'}${resourceInfo}${fileInfo}\n\n` +
               `Would you like to submit this ticket?`;
      },
      options: ["Submit Ticket", "Back to Main Menu"],
      chatDisabled: true,
      function: async (chatState) => {
        if (chatState.userInput === "Submit Ticket") {
          const currentForm = getCurrentTicketForm();
          const formWithUserInfo = getCurrentFormWithUserInfo(userInfo);
          const formData = {
            // Regular JSM fields
            email: formWithUserInfo.email || "",
            summary: currentForm.summary || "General Support Ticket",
            description: currentForm.description || "",
            priority: currentForm.priority || "medium",
            accessId: formWithUserInfo.accessId || "",
            userName: formWithUserInfo.name || "",
            issueType: currentForm.category || "",
            // ProForma fields for request type 17
            hasResourceProblem: currentForm.involvesResource === 'yes' ? 'Yes' : 'No',
            userIdAtResource: currentForm.userIdAtResource || "",
            resourceName: currentForm.resourceDetails || "",
            keywords: currentForm.keywords || "",
            noRelevantKeyword: currentForm.suggestedKeyword ? 'checked' : '',
            suggestedKeyword: currentForm.suggestedKeyword || ""
          };

          await submitTicket(formData, 'support', currentForm.uploadedFiles || []);
        }
      },
      path: (chatState) => {
        if (chatState.userInput === "Submit Ticket") {
          return "general_help_success";
        } else {
          return "start";
        }
      }
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