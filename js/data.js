/**
 * JanSetu AI - Core Mock Dataset & Civic Knowledge Base
 */

const INITIAL_ISSUES = [
  {
    id: "JS-2026-00421",
    title: "Severe Garbage Accumulation near Govt Primary School",
    category: "Sanitation",
    priority: "HIGH",
    status: "New",
    location: "Near Govt School, Mysuru",
    ward: "Ward 42, Vani Vilas Mohalla",
    district: "Mysuru",
    assembly: "Chamaraja",
    coordinates: [12.3051, 76.6432],
    reportedAt: "2 hours ago",
    date: "2026-08-25",
    reporter: {
      name: "Anonymous Citizen",
      phone: "+91 98450 *****",
      isProtected: true,
      verified: true
    },
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDNsxQb-EkJxfp4baqg-0F2t43afuciRrn_-Zv9jW3BoFHmrLp_DBOeXqaJY-gjvUQbNL0Xuif86IVa4-c6037D1QTEV643Hodh7CkaQzFt8ZrmXA_DlNxbHHIyftxKD6xg-up44Lx9rC34u3n5qPWDvxJtC1ZttCYwSF0o-Eq__47iOkNxiPyO3dSADn6Vx0CJ4rIPHiKgKF0oH7MUhJMvxLJd4BdT89tGOgISWJblIgCF9Ah0Ddr9yA",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAlal71ddL5Pihl7XdEe2CYPC8X8Ltd91dUFs0q8Hdi2sbhjbJRuI_3NPu2xohL-K3wn7PxuozZ4_sxCsdoXwg5gkffNuYSreBXnrndF9NBNWEkjFoINKL20UGlqeLIJMj7pAVQQbLNlM6M46iIc_rgTLTsKPlhTpGFbz-lmo2fzOGtQeIQkuVupwSrONNLi-i31WBy9fBdghObLQHr-AK_dMEvJkQOamTdmSsiIFNC00We3PxFqMNn-w"
    ],
    description: "There is garbage everywhere near the government primary school entrance causing foul smell and health risks to schoolchildren.",
    aiSummary: "Multiple user reports indicate severe sanitation hazard near school premises. Immediate clearance recommended to prevent health risks to students.",
    aiConfidence: 94,
    detectedObjects: ["Garbage bags", "Solid waste", "Public footpath", "School boundary wall"],
    assignedTo: null,
    resolutionProof: null,
    upvotes: 42
  },
  {
    id: "JS-2026-00420",
    title: "Dangerous Pothole on Ring Road Junction",
    category: "Roads",
    priority: "MED",
    status: "Under Review",
    location: "Ring Road Jct, Outer Ring Road",
    ward: "Ward 18, Dattagalli",
    district: "Mysuru",
    assembly: "Chamundeshwari",
    coordinates: [12.2850, 76.6200],
    reportedAt: "2 days ago",
    date: "2026-08-23",
    reporter: {
      name: "Ramesh Kumar",
      phone: "+91 94481 *****",
      isProtected: true,
      verified: true
    },
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC9H8D4s0giwvwvOQ-CFhLb0RjI06xOuY2axYf3RIOL6SJwQ1pgNkHNOWVlUKNWDeqhh4YTOtTfDmQxgnPltqkH3Lqw065GkT9QefLyO7XL4JwI65cDm8hK0Jj-ZSGb87ovCU7QQgW9-vKKXnU6pL_gk6ninIoodRiVk_PmWB60ta-15vB27kQi4Y8ddjhXGUfD2hek_V07963-gt4p4ettaVUdjDTrSnAFtG3fkar3Z_htJD1CBrtRiA"
    ],
    description: "Large 2-foot wide pothole causing 2-wheelers to skid near the signal.",
    aiSummary: "Road surface integrity failure detected on primary junction. High traffic zone skidding hazard.",
    aiConfidence: 91,
    detectedObjects: ["Asphalt fissure", "Pothole cavity", "Traffic lane"],
    assignedTo: "PWD Road Maintenance Crew 4",
    resolutionProof: null,
    upvotes: 89
  },
  {
    id: "JS-2026-00419",
    title: "Major Drinking Water Pipeline Leak",
    category: "Water",
    priority: "LOW",
    status: "Resolved",
    location: "8th Cross, Kuvempu Nagar",
    ward: "Ward 29, Kuvempunagar",
    district: "Mysuru",
    assembly: "Krishnaraja",
    coordinates: [12.2905, 76.6341],
    reportedAt: "1 week ago",
    date: "2026-08-18",
    reporter: {
      name: "Deepa S.",
      phone: "+91 81050 *****",
      isProtected: true,
      verified: true
    },
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCnEAFQGmk_abQC1cGNifekTHo2_lr6u6soz4ofOsYl2FN_F5np9L3P4dFly8SldOGEV2OPf8oYFVEW-uqOnj7FLKLbOHB2d1TB0LsJ74FWkcYQFKhx7JCb2bt9TVaZUPCMIE31FFoLPbxdyKNh0AaHnDvvlSZraS07FG3Grap9IsSpabjvt7HLfhn_jBvTTFBBgvXFAMhQgU0m6UEyt6hv0eredW-hgtymwQHjMyEpwtTkAg45mNdFVw"
    ],
    description: "Drinking water pipeline ruptured under sidewalk, wasting potable water for 24h.",
    aiSummary: "Pressurized potable water distribution conduit breach. Repaired and pressure verified.",
    aiConfidence: 96,
    detectedObjects: ["Water pipe joint", "Water leakage", "Excavation area"],
    assignedTo: "Mysuru Urban Water Supply Dept",
    resolutionProof: "Repaired with reinforced sleeve joint on Aug 20.",
    upvotes: 112
  },
  {
    id: "JS-2026-00418",
    title: "Exposed High-Tension Electrical Cable near Footpath",
    category: "Electricity",
    priority: "HIGH",
    status: "Assigned",
    location: "Hebbal Industrial Area 3rd Phase",
    ward: "Ward 05, Hebbal",
    district: "Mysuru",
    assembly: "Narasimharaja",
    coordinates: [12.3610, 76.6022],
    reportedAt: "4 hours ago",
    date: "2026-08-25",
    reporter: {
      name: "Anand M.",
      phone: "+91 97312 *****",
      isProtected: true,
      verified: true
    },
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDNglpP62q-wJ2o-Wwdr6kr8VL42wdkIZZ9RZcKwZVTV3CLxj50L8zOAf5Mf2auFc2gnnkZ-B8ig4mhCbjlohbUPwkPn3r53YV0VCwMRrIsRzEixEFgU8mAqpdka0TdpcNEeq7wNF1uhx91GL3a1wZD8Fbi6OAOZXxRk5-CpJwCP5yA5ju0XZmEXWoqqryAPsxTr9ywhGscJjeNnuDzDrItfeuezyuyqvhJEwf2zIa0nrqrXBp8_IIXiA"
    ],
    description: "Live cable dangling from junction box right next to pedestrian walkway.",
    aiSummary: "Severe electrical hazard. Uninsulated conductor exposed in public pedestrian right-of-way.",
    aiConfidence: 95,
    detectedObjects: ["Electric cable", "Transformer panel", "Pedestrian walkway"],
    assignedTo: "CHESCOM Rapid Response Unit 2",
    resolutionProof: null,
    upvotes: 67
  },
  {
    id: "JS-2026-00417",
    title: "Cleaned Park Pathway & Installed Segregated Bins",
    category: "Sanitation",
    priority: "LOW",
    status: "Resolved",
    location: "Northside Children's Park",
    ward: "Ward 12, Gokulam 3rd Stage",
    district: "Mysuru",
    assembly: "Chamaraja",
    coordinates: [12.3255, 76.6310],
    reportedAt: "5 days ago",
    date: "2026-08-20",
    reporter: {
      name: "Citizens Welfare Group",
      phone: "+91 80220 *****",
      isProtected: false,
      verified: true
    },
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBf7SjueGz71LlzmrRuq9lMo8jL3osYBt6ZHtiFgoOZn1ucSZfjBGbTElqqb8U311Ve1mHmds6OdNUQyD6QssIKW2OoyZ43uJdwlNwI4gfHTSbqxsI_GDQV6u95nJ7XyDWLrDoHSo40T5rOsydVOV1r09ObfsZQfwtOTb5ZsvuONau28NSL9N0z2rxG2LRI-RZQDLY8rcqtWxSwfslyjmGWp6VAooal-CkLrJa47hkZxeNOuy64Mxc88g"
    ],
    description: "Children park littered with plastic waste and broken glass bottles.",
    aiSummary: "Sanitation restoration complete. 120kg waste cleared and twin smart dustbins placed.",
    aiConfidence: 97,
    detectedObjects: ["Park pathway", "Greenery", "Municipal dustbins"],
    assignedTo: "MCC Health & Sanitation Division",
    resolutionProof: "Cleaned and sanitized with regular monitoring schedule set.",
    upvotes: 145
  },
  {
    id: "JS-2026-00416",
    title: "Open Drainage Cover on Main Commercial Street",
    category: "Roads",
    priority: "HIGH",
    status: "Under Review",
    location: "Devaraj Urs Road near Sub-Urban Bus Stand",
    ward: "Ward 35, Shivarampet",
    district: "Mysuru",
    assembly: "Chamaraja",
    coordinates: [12.3110, 76.6520],
    reportedAt: "1 day ago",
    date: "2026-08-24",
    reporter: {
      name: "Pooja Hegde",
      phone: "+91 99002 *****",
      isProtected: true,
      verified: true
    },
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDNglpP62q-wJ2o-Wwdr6kr8VL42wdkIZZ9RZcKwZVTV3CLxj50L8zOAf5Mf2auFc2gnnkZ-B8ig4mhCbjlohbUPwkPn3r53YV0VCwMRrIsRzEixEFgU8mAqpdka0TdpcNEeq7wNF1uhx91GL3a1wZD8Fbi6OAOZXxRk5-CpJwCP5yA5ju0XZmEXWoqqryAPsxTr9ywhGscJjeNnuDzDrItfeuezyuyqvhJEwf2zIa0nrqrXBp8_IIXiA"
    ],
    description: "Concrete slab over storm drain collapsed, leaving an open trap on busy market street.",
    aiSummary: "Structural collapse of stormwater drain cover on high-density pedestrian thoroughfare.",
    aiConfidence: 93,
    detectedObjects: ["Open manhole", "Collapsed concrete slab", "Road surface"],
    assignedTo: "MCC Civil Engineering Cell",
    resolutionProof: null,
    upvotes: 104
  }
];

const CONSTITUENCIES_DATA = {
  "Mysuru": {
    name: "Mysuru (Chamaraja / Chamundeshwari)",
    district: "Mysuru District",
    mlaName: "K. Govindaraj",
    designation: "Member of Legislative Assembly",
    party: "Independent / Civic Alliance",
    photo: "https://lh3.googleusercontent.com/aida-public/AB6AXuBRQLMiiqAQUHIxb_7HPS3P25s4UVRL1QdK9RqYrYPZYvQ-NjB4_5RqbId-4JAcfKDGv_nWIAQ40uy6Zih8MY8WpEnYlD2-0aGdjpSfrYuEzbcbVwy_5Ebuni5uinoCjSOqC0INXwYi15BzgFGKzu3SYjU4nlwszJceGVmLnXMKdIVUlWtZfrJwsy3orWazs-rOE7dgp5ZgGmoJFl9IJyK8Z46Z82mGz0FKc1J9qmPzeD5NnjHFyuBkng",
    email: "office.govindaraj@karnataka.gov.in",
    officeLocation: "Mini Vidhana Soudha, Nazarbad, Mysuru",
    totalIssues: 1204,
    highPriority: 87,
    resolvedRate: "68%",
    wards: [
      { name: "Ward 42 - Vani Vilas Mohalla", active: 14, resolved: 48 },
      { name: "Ward 18 - Dattagalli", active: 9, resolved: 31 },
      { name: "Ward 29 - Kuvempunagar", active: 11, resolved: 62 },
      { name: "Ward 12 - Gokulam", active: 6, resolved: 54 }
    ]
  },
  "Bengaluru South": {
    name: "Bengaluru South (Jayanagar / BTM)",
    district: "Bengaluru Urban",
    mlaName: "Ramalinga Reddy",
    designation: "Minister for Transport & MLA",
    party: "INC",
    photo: "https://lh3.googleusercontent.com/aida-public/AB6AXuBRQLMiiqAQUHIxb_7HPS3P25s4UVRL1QdK9RqYrYPZYvQ-NjB4_5RqbId-4JAcfKDGv_nWIAQ40uy6Zih8MY8WpEnYlD2-0aGdjpSfrYuEzbcbVwy_5Ebuni5uinoCjSOqC0INXwYi15BzgFGKzu3SYjU4nlwszJceGVmLnXMKdIVUlWtZfrJwsy3orWazs-rOE7dgp5ZgGmoJFl9IJyK8Z46Z82mGz0FKc1J9qmPzeD5NnjHFyuBkng",
    email: "mla.btm@bbmp.gov.in",
    officeLocation: "BBMP Ward Office, 4th Block Jayanagar",
    totalIssues: 3410,
    highPriority: 215,
    resolvedRate: "72%",
    wards: [
      { name: "Ward 177 - JP Nagar", active: 22, resolved: 98 },
      { name: "Ward 176 - BTM Layout", active: 31, resolved: 142 },
      { name: "Ward 168 - Pattabhirama Nagar", active: 12, resolved: 87 }
    ]
  },
  "Malleshwaram": {
    name: "Malleshwaram, Bengaluru",
    district: "Bengaluru Urban",
    mlaName: "Dr. C. N. Ashwath Narayan",
    designation: "Member of Legislative Assembly",
    party: "BJP",
    photo: "https://lh3.googleusercontent.com/aida-public/AB6AXuBRQLMiiqAQUHIxb_7HPS3P25s4UVRL1QdK9RqYrYPZYvQ-NjB4_5RqbId-4JAcfKDGv_nWIAQ40uy6Zih8MY8WpEnYlD2-0aGdjpSfrYuEzbcbVwy_5Ebuni5uinoCjSOqC0INXwYi15BzgFGKzu3SYjU4nlwszJceGVmLnXMKdIVUlWtZfrJwsy3orWazs-rOE7dgp5ZgGmoJFl9IJyK8Z46Z82mGz0FKc1J9qmPzeD5NnjHFyuBkng",
    email: "dr.ashwath@karnataka.gov.in",
    officeLocation: "8th Cross, Sampige Road, Malleshwaram",
    totalIssues: 1890,
    highPriority: 94,
    resolvedRate: "79%",
    wards: [
      { name: "Ward 45 - Malleshwaram", active: 8, resolved: 110 },
      { name: "Ward 35 - Aramane Nagar", active: 14, resolved: 76 },
      { name: "Ward 65 - Kadu Malleshwara", active: 5, resolved: 95 }
    ]
  },
  "Hubballi-Dharwad Central": {
    name: "Hubballi-Dharwad Central",
    district: "Dharwad",
    mlaName: "Mahesh Tenginkai",
    designation: "Member of Legislative Assembly",
    party: "BJP",
    photo: "https://lh3.googleusercontent.com/aida-public/AB6AXuBRQLMiiqAQUHIxb_7HPS3P25s4UVRL1QdK9RqYrYPZYvQ-NjB4_5RqbId-4JAcfKDGv_nWIAQ40uy6Zih8MY8WpEnYlD2-0aGdjpSfrYuEzbcbVwy_5Ebuni5uinoCjSOqC0INXwYi15BzgFGKzu3SYjU4nlwszJceGVmLnXMKdIVUlWtZfrJwsy3orWazs-rOE7dgp5ZgGmoJFl9IJyK8Z46Z82mGz0FKc1J9qmPzeD5NnjHFyuBkng",
    email: "hdmc.central@karnataka.gov.in",
    officeLocation: "HDMC Main Building, Hubballi",
    totalIssues: 940,
    highPriority: 62,
    resolvedRate: "61%",
    wards: [
      { name: "Ward 22 - Vidyanagar", active: 12, resolved: 41 },
      { name: "Ward 38 - Old Hubli", active: 18, resolved: 35 }
    ]
  }
};

const PRESET_ANALYSES = {
  garbage: {
    category: "Sanitation",
    severity: "High",
    severityClass: "text-error bg-error/10 border-error/20",
    confidence: 94,
    objects: "Garbage bags, Solid waste, Public Road, Waste accumulation",
    draft: "Garbage has accumulated near the government school, creating an unhygienic environment and health hazard for students. Immediate cleanup required.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDNsxQb-EkJxfp4baqg-0F2t43afuciRrn_-Zv9jW3BoFHmrLp_DBOeXqaJY-gjvUQbNL0Xuif86IVa4-c6037D1QTEV643Hodh7CkaQzFt8ZrmXA_DlNxbHHIyftxKD6xg-up44Lx9rC34u3n5qPWDvxJtC1ZttCYwSF0o-Eq__47iOkNxiPyO3dSADn6Vx0CJ4rIPHiKgKF0oH7MUhJMvxLJd4BdT89tGOgISWJblIgCF9Ah0Ddr9yA"
  },
  pothole: {
    category: "Roads",
    severity: "High",
    severityClass: "text-error bg-error/10 border-error/20",
    confidence: 96,
    objects: "Severe road crater, Asphalt breakdown, Traffic lane obstruction",
    draft: "Deep pothole located on high-speed road corridor posing immediate risk to two-wheelers and pedestrians. Urgent resurfacing needed.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC9H8D4s0giwvwvOQ-CFhLb0RjI06xOuY2axYf3RIOL6SJwQ1pgNkHNOWVlUKNWDeqhh4YTOtTfDmQxgnPltqkH3Lqw065GkT9QefLyO7XL4JwI65cDm8hK0Jj-ZSGb87ovCU7QQgW9-vKKXnU6pL_gk6ninIoodRiVk_PmWB60ta-15vB27kQi4Y8ddjhXGUfD2hek_V07963-gt4p4ettaVUdjDTrSnAFtG3fkar3Z_htJD1CBrtRiA"
  },
  water: {
    category: "Water Supply",
    severity: "Medium",
    severityClass: "text-[#d97706] bg-[#d97706]/10 border-[#d97706]/20",
    confidence: 93,
    objects: "Water conduit leak, Flooded sidewalk, Potable water waste",
    draft: "Municipal drinking water pipe leak causing continuous water loss and localized waterlogging on the pedestrian walkway.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCnEAFQGmk_abQC1cGNifekTHo2_lr6u6soz4ofOsYl2FN_F5np9L3P4dFly8SldOGEV2OPf8oYFVEW-uqOnj7FLKLbOHB2d1TB0LsJ74FWkcYQFKhx7JCb2bt9TVaZUPCMIE31FFoLPbxdyKNh0AaHnDvvlSZraS07FG3Grap9IsSpabjvt7HLfhn_jBvTTFBBgvXFAMhQgU0m6UEyt6hv0eredW-hgtymwQHjMyEpwtTkAg45mNdFVw"
  },
  streetlight: {
    category: "Electricity",
    severity: "Medium",
    severityClass: "text-[#d97706] bg-[#d97706]/10 border-[#d97706]/20",
    confidence: 89,
    objects: "Streetlight fixture non-functional, Dark zone, Public safety risk",
    draft: "Public streetlights in this residential lane have been non-operational for 3 consecutive nights, causing security and pedestrian safety issues.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDNglpP62q-wJ2o-Wwdr6kr8VL42wdkIZZ9RZcKwZVTV3CLxj50L8zOAf5Mf2auFc2gnnkZ-B8ig4mhCbjlohbUPwkPn3r53YV0VCwMRrIsRzEixEFgU8mAqpdka0TdpcNEeq7wNF1uhx91GL3a1wZD8Fbi6OAOZXxRk5-CpJwCP5yA5ju0XZmEXWoqqryAPsxTr9ywhGscJjeNnuDzDrItfeuezyuyqvhJEwf2zIa0nrqrXBp8_IIXiA"
  }
};

const I18N = {
  en: {
    brand: "JanSetu AI",
    heroTitle: "Your Voice. Your Rights. Your Community.",
    heroSub: "See a public problem? Report it using text, voice or a photograph. JanSetu AI connects citizens directly with authorities to ensure rapid resolution.",
    btnReport: "Report a Problem",
    btnExplore: "Public Issues",
    btnConstituency: "Constituency Explorer",
    btnAuthority: "Authority Portal",
    btnCitizenLogin: "Citizen Login",
    howItWorks: "How It Works",
    howItWorksSub: "A seamless process from reporting to resolution, powered by AI.",
    successStories: "Recent Success Stories",
    successStoriesSub: "Real impact in your community.",
    resolved: "Resolved",
    totalReports: "Total Reports",
    underReview: "Under Review",
    pending: "Pending",
    step1: "1. Capture",
    step1Desc: "Report issues instantly using text, voice notes, or simply snapping a photo.",
    step2: "2. AI Analysis",
    step2Desc: "Our system automatically categorizes the issue and assigns priority.",
    step3: "3. Action",
    step3Desc: "The relevant department is immediately notified with exact location data.",
    step4: "4. Resolution",
    step4Desc: "Track progress in real-time until the issue is officially resolved."
  },
  kn: {
    brand: "ಜನಸೇತು AI",
    heroTitle: "ನಿಮ್ಮ ಧ್ವನಿ. ನಿಮ್ಮ ಹಕ್ಕು. ನಿಮ್ಮ ಸಮುದಾಯ.",
    heroSub: "ಸಾರ್ವಜನಿಕ ಸಮಸ್ಯೆಗಳನ್ನು ನೋಡಿದ್ದೀರಾ? ಪಠ್ಯ, ಧ್ವನಿ ಅಥವಾ ಫೋಟೋ ಬಳಸಿ ಸುಲಭವಾಗಿ ದೂರು ನೀಡಿ. ತ್ವರಿತ ಪರಿಹಾರಕ್ಕಾಗಿ ನಾಗರಿಕರನ್ನು ನೇರವಾಗಿ ಪ್ರಾಧಿಕಾರಗಳೊಂದಿಗೆ ಜನಸೇತು ಸಂಪರ್ಕಿಸುತ್ತದೆ.",
    btnReport: "ಸಮಸ್ಯೆ ವರದಿ ಮಾಡಿ",
    btnExplore: "ಸಾರ್ವಜನಿಕ ಸಮಸ್ಯೆಗಳು",
    btnConstituency: "ಕ್ಷೇತ್ರ ಮಾಹಿತಿ",
    btnAuthority: "ಪ್ರಾಧಿಕಾರ ಪೋರ್ಟಲ್",
    btnCitizenLogin: "ನಾಗರಿಕ ಲಾಗಿನ್",
    howItWorks: "ಇದು ಹೇಗೆ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ",
    howItWorksSub: "AI ಚಾಲಿತ ತ್ವರಿತ ಪರಿಹಾರ ಪ್ರಕ್ರಿಯೆ.",
    successStories: "ಇತ್ತೀಚಿನ ಯಶಸ್ವಿ ಪರಿಹಾರಗಳು",
    successStoriesSub: "ನಿಮ್ಮ ಸಮುದಾಯದಲ್ಲಿ ನೈಜ ಪ್ರಭಾವ.",
    resolved: "ಪರಿಹರಿಸಲಾಗಿದೆ",
    totalReports: "ಒಟ್ಟು ವರದಿಗಳು",
    underReview: "ಪರಿಶೀಲನೆಯಲ್ಲಿದೆ",
    pending: "ಬಾಕಿ ಇದೆ",
    step1: "೧. ಸೆರೆಹಿಡಿಯಿರಿ",
    step1Desc: "ಪಠ್ಯ, ಧ್ವನಿ ಅಥವಾ ಫೋಟೋ ಮೂಲಕ ತಕ್ಷಣವೇ ವರದಿ ಮಾಡಿ.",
    step2: "೨. AI ವಿಶ್ಲೇಷಣೆ",
    step2Desc: "ನಮ್ಮ AI ವ್ಯವಸ್ಥೆಯು ವರ್ಗ ಮತ್ತು ಆದ್ಯತೆಯನ್ನು ಸ್ವಯಂಚಾಲಿತವಾಗಿ ನಿರ್ಧರಿಸುತ್ತದೆ.",
    step3: "೩. ಕ್ರಮ",
    step3Desc: "ನಿಖರ ಸ್ಥಳದೊಂದಿಗೆ ಸಂಬಂಧಿತ ಇಲಾಖೆಗೆ ತಕ್ಷಣವೇ ಮಾಹಿತಿ ರವಾನೆ.",
    step4: "೪. ಪರಿಹಾರ",
    step4Desc: "ಸಮಸ್ಯೆ ಪೂರ್ಣ ಪರಿಹಾರವಾಗುವವರೆಗೆ ನೈಜ ಸಮಯದಲ್ಲಿ ಪ್ರಗತಿಯನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ."
  }
};

const HUMAN_RIGHTS_DATA = [
  {
    en: "RIGHT TO EQUALITY",
    kn: "ಸಮಾನತೆಯ ಹಕ್ಕು"
  },
  {
    en: "RIGHT TO FREEDOM OF SPEECH",
    kn: "ಅಭಿವ್ಯಕ್ತಿ ಸ್ವಾತಂತ್ರ್ಯದ ಹಕ್ಕು"
  },
  {
    en: "RIGHT TO LIFE & LIBERTY",
    kn: "ಜೀವಿಸುವ ಮತ್ತು ವೈಯಕ್ತಿಕ ಸ್ವಾತಂತ್ರ್ಯದ ಹಕ್ಕು"
  },
  {
    en: "RIGHT TO EDUCATION",
    kn: "ಶಿಕ್ಷಣದ ಹಕ್ಕು"
  },
  {
    en: "RIGHT TO CLEAN ENVIRONMENT",
    kn: "ಸ್ವಚ್ಛ ಪರಿಸರದ ಹಕ್ಕು"
  },
  {
    en: "RIGHT TO INFORMATION",
    kn: "ಮಾಹಿತಿ ಹಕ್ಕು (RTI)"
  },
  {
    en: "RIGHT TO CONSTITUTIONAL REMEDIES",
    kn: "ಸಾಂವಿಧಾನಿಕ ಪರಿಹಾರಗಳ ಹಕ್ಕು"
  },
  {
    en: "RIGHT AGAINST EXPLOITATION",
    kn: "ಶೋಷಣೆಯ ವಿರುದ್ಧದ ಹಕ್ಕು"
  },
  {
    en: "RIGHT TO PRIVACY",
    kn: "ಗೌಪ್ಯತೆಯ ಹಕ್ಕು"
  },
  {
    en: "RIGHT TO HEALTH & SANITATION",
    kn: "ಆರೋಗ್ಯ ಮತ್ತು ನೈರ್ಮಲ್ಯದ ಹಕ್ಕು"
  },
  {
    en: "RIGHT TO ACCESSIBLE INFRASTRUCTURE",
    kn: "ಮೂಲಸೌಕರ್ಯದ ಹಕ್ಕು"
  },
  {
    en: "RIGHT TO FAIR ADMINISTRATIVE ACTION",
    kn: "ನ್ಯಾಯಯುತ ಆಡಳಿತದ ಹಕ್ಕು"
  }
];

const KARNATAKA_DISTRICTS_MAP = {
  "Mysuru": [
    "Chamaraja",
    "Chamundeshwari",
    "Krishnaraja",
    "Narasimharaja",
    "Varuna",
    "Hunsur",
    "Nanjangud",
    "Periyapatna",
    "T. Narasipura"
  ],
  "Bengaluru Urban": [
    "Malleshwaram",
    "BTM Layout",
    "Jayanagar",
    "Bengaluru South",
    "Shivajinagar",
    "Mahadevapura",
    "Rajajinagar",
    "Shanti Nagar",
    "Chickpet",
    "Basavanagudi",
    "Padmanaba Nagar",
    "Yeshwanthpur",
    "Byatarayanapura",
    "K.R. Puram",
    "Hebbal",
    "Sarvagnanagar",
    "C.V. Raman Nagar",
    "Pulakeshinagar",
    "Gandhi Nagar",
    "Vijayanagar",
    "Govindraj Nagar",
    "Dasarahalli",
    "Yelahanka",
    "Bommanahalli",
    "Anekal"
  ],
  "Bengaluru Rural": [
    "Nelamangala",
    "Doddaballapur",
    "Devanahalli",
    "Hosakote"
  ],
  "Dharwad": [
    "Hubballi-Dharwad Central",
    "Hubballi-Dharwad East",
    "Hubballi-Dharwad West",
    "Dharwad",
    "Navalgund",
    "Kundgol",
    "Kalghatgi"
  ],
  "Dakshina Kannada": [
    "Mangaluru City South",
    "Mangaluru City North",
    "Mangaluru",
    "Bantwal",
    "Puttur",
    "Sullia",
    "Belthangady",
    "Moodabidri"
  ],
  "Belagavi": [
    "Belagavi Uttar",
    "Belagavi Dakshin",
    "Belagavi Rural",
    "Gokak",
    "Chikkodi-Sadalga",
    "Bailhongal",
    "Athani",
    "Kagwad",
    "Kudachi",
    "Raybag",
    "Hukkeri",
    "Arabhavi",
    "Yemkanmardi",
    "Kittur",
    "Ramdurg",
    "Saundatti Yellamma",
    "Nippani"
  ],
  "Shivamogga": [
    "Shivamogga Urban",
    "Shivamogga Rural",
    "Bhadravati",
    "Thirthahalli",
    "Sagara",
    "Shikaripura",
    "Soraba"
  ],
  "Tumakuru": [
    "Tumakuru City",
    "Tumakuru Rural",
    "Tiptur",
    "Sira",
    "Gubbi",
    "Kunigal",
    "Madhugiri",
    "Pavagada",
    "Chiknayakanhalli",
    "Turuvekere"
  ],
  "Hassan": [
    "Hassan",
    "Holenarasipur",
    "Arsikere",
    "Belur",
    "Sakleshpur",
    "Channarayapatna",
    "Arkalgud",
    "Shravanabelagola"
  ],
  "Kalaburagi": [
    "Kalaburagi Uttar",
    "Kalaburagi Dakshin",
    "Kalaburagi Rural",
    "Afzalpur",
    "Jevargi",
    "Sedam",
    "Chittapur",
    "Aland",
    "Chincholi"
  ],
  "Ballari": [
    "Ballari City",
    "Ballari Rural",
    "Siruguppa",
    "Kampli",
    "Sandur"
  ],
  "Udupi": [
    "Udupi",
    "Kaup",
    "Kundapura",
    "Karkala",
    "Byndoor"
  ]
};

const INITIAL_USERS = [
  {
    name: "Ramesh Kumar",
    email: "ramesh.kumar@gmail.com",
    gender: "Male",
    state: "Karnataka",
    district: "Mysuru",
    constituency: "Chamaraja",
    password: "password123",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&h=120&q=80",
    reportsCount: 3,
    upvotesCount: 14
  },
  {
    name: "Deepa S.",
    email: "deepa.sharma@yahoo.com",
    gender: "Female",
    state: "Karnataka",
    district: "Bengaluru Urban",
    constituency: "Malleshwaram",
    password: "password123",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&h=120&q=80",
    reportsCount: 5,
    upvotesCount: 28
  }
];

