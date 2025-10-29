interface Art {
    id: number;
    title: string;
    artist: string;
    year: string;
    description: string;
    story: string;
    image: string;
}

export const art: Art[] = [
  {
    id: 1,
    title: "Bronze Head from Ife",
    artist: "Ancient Ife Civilization",
    year: "12th-15th Century",
    description:
      "One of the most celebrated examples of African bronze casting, this naturalistic portrait demonstrates the sophisticated metalworking techniques of medieval Ife.",
    story:
      "Discovered in 1938 in Wunmonije Compound, Ife, this bronze head revolutionized Western perceptions of African art. The remarkable realism and technical precision challenged colonial narratives that dismissed African artistic achievement. These heads likely represented Ooni (divine kings) of Ife and were used in royal ceremonies. The parallel grooves on the face may represent scarification marks or the attachment points for beaded veils worn during rituals.",
    image: "/images/bronze-head-from-ife.jpg",
  },
  {
    id: 2,
    title: "Benin Plaque: Royal Procession",
    artist: "Benin Kingdom Court Artists",
    year: "16th-17th Century",
    description:
      "Cast bronze relief plaque depicting warriors and courtiers from the royal court of the Benin Kingdom, representing the pinnacle of West African metallurgy.",
    story:
      "These plaques once decorated the wooden pillars of the Oba's palace in Benin City. In 1897, British forces looted over 10,000 bronze artifacts during a punitive expedition—one of history's greatest cultural thefts. Today, these works are scattered across Western museums, sparking ongoing repatriation debates. The plaques documented court life, military victories, and royal genealogies, serving as both art and historical record. The lost-wax casting technique used remains a closely guarded tradition.",
    image: "/images/benin-bronze-plaque.jpg",
  },
  {
    id: 3,
    title: "Nok Terracotta Sculpture",
    artist: "Nok Culture Artists",
    year: "500 BCE - 200 CE",
    description:
      "Ancient terracotta figure from the Nok culture, one of Africa's earliest known civilizations to produce life-sized terracotta sculptures.",
    story:
      "Named after the village where they were first discovered in 1928, Nok terracottas represent West Africa's earliest sculptural tradition. These figures pre-date the famous Ife and Benin bronze works by over a thousand years. The distinctive triangular eyes, elaborate hairstyles, and jewelry suggest a sophisticated society with complex social hierarchies. Archaeologists believe they may have served ritual or commemorative purposes. The Nok culture also pioneered iron smelting in West Africa, fundamentally shaping the region's technological development.",
    image: "/images/nok-figure.jpg",
  },
  {
    id: 4,
    title: "Igbo-Ukwu Ceremonial Vessel",
    artist: "Igbo-Ukwu Civilization",
    year: "9th-10th Century",
    description:
      "Intricately decorated bronze vessel showcasing the extraordinary technical mastery of ancient Igbo metalworkers, pre-dating European contact.",
    story:
      "Discovered accidentally in 1939 when a farmer was digging a water cistern, the Igbo-Ukwu bronzes shocked the archaeological world. Carbon dating revealed they were created around 850 CE—before the famous Ife and Benin works. The elaborate surface decorations feature insects, snakes, and abstract patterns with a level of detail that seems almost impossible for the era. These objects likely belonged to a wealthy ruler or priest-king and were used in elaborate burial ceremonies. The discovery proved that sophisticated civilizations thrived in Nigeria long before colonial narratives suggested.",
    image: "/images/igbo-ukwu.jpg",
  },
  {
    id: 5,
    title: "Esie Stone Figure",
    artist: "Unknown Ancient Civilization",
    year: "Date Unknown (pre-16th Century)",
    description:
      "One of over 1,000 mysterious soapstone sculptures discovered in Esie, representing the largest collection of stone carvings in sub-Saharan Africa.",
    story:
      "The Esie figures remain one of Nigeria's greatest archaeological mysteries. Local oral tradition claims the sculptures represent visiting strangers who were turned to stone for violating sacred customs. Scholars suggest they may be ancestor figures from a lost civilization. The sheer number—over 1,000 figures—and their arrangement suggest they once formed a massive sacred site. The people depicted wear elaborate jewelry and ceremonial attire, suggesting a highly stratified society. Despite decades of research, their exact age, purpose, and creators remain unknown, adding to their mystique.",
    image: "/images/esie-unique-stones.jpg",
  },
  {
    id: 6,
    title: "Gelede Mask",
    artist: "Yoruba Artists (Egbado Region)",
    year: "19th-20th Century",
    description:
      "Colorful wooden mask used in Gelede ceremonies honoring elderly women and the spiritual power of mothers in Yoruba society.",
    story:
      "Gelede is a spectacular masquerade tradition that celebrates 'our mothers'—the spiritual power of elderly women and female ancestors. Performed at night with elaborate costumes, drumming, and dance, Gelede ceremonies maintain social harmony and honor feminine energy. The masks feature two parts: a calm female face below and an elaborate superstructure above depicting anything from animals to modern motorcycles, often with satirical social commentary. UNESCO recognized Gelede as a Masterpiece of Oral and Intangible Heritage of Humanity. The tradition continues today in southwestern Nigeria and diaspora communities.",
    image: "/images/yoruba-gelede.jpg",
  },
  {
    id: 7,
    title: "Ekpu Ancestral Figure",
    artist: "Oron Artists",
    year: "18th-19th Century",
    description:
      "Wooden memorial sculpture from the Oron people of southeastern Nigeria, representing a deceased community leader or ancestor.",
    story:
      "The Oron people created some of the most hauntingly beautiful ancestor figures in African art. Ekpu figures were carved to commemorate important deceased individuals and placed in sacred groves where they served as intermediaries between the living and dead. Each figure captured the personality and achievements of the deceased—warriors might be shown with weapons, while leaders held symbols of authority. Unfortunately, many Ekpu figures were destroyed or scattered during the Nigerian Civil War (1967-1970). Those that survived are now treasured as masterpieces of Nigerian wood sculpture, known for their serene expressions and naturalistic proportions.",
    image: "/images/ekpu-figure.jpg",
  },
  {
    id: 8,
    title: "Ivory Pendant Mask of Queen Idia",
    artist: "Benin Kingdom Court Artists",
    year: "16th Century",
    description:
      "Exquisite ivory mask pendant believed to represent Queen Mother Idia, worn by the Oba during important ceremonies.",
    story:
      "This mask honors Idia, the powerful queen mother who wielded significant political and mystical influence in 16th-century Benin. Legend says she used her magical powers to help her son Esigie win crucial battles and secure his throne. The mask would have been worn at the Oba's hip during ceremonies. The Portuguese heads decorating the crown represent Benin's early contact with European traders. This mask has become one of Africa's most iconic artworks—it inspired the logo for FESTAC '77 (the Second World Festival of Black and African Arts and Culture) and appears on Nigerian currency. Like many Benin treasures, it was looted in 1897 and now resides in the British Museum, a focal point of repatriation campaigns.",
    image: "/images/benin-ivory-mask.jpg",
  },
  {
    id: 9,
    title: "Ikom Monolith",
    artist: "Unknown Ancient Culture (Cross River Region)",
    year: "200-1600 CE (estimated)",
    description:
      "Mysterious carved stone pillar from Cross River State, one of over 300 monoliths whose purpose remains debated by scholars.",
    story:
      "Standing in circles throughout the Cross River region, these enigmatic stone pillars have puzzled researchers for decades. Some feature carved facial features, others display phallic shapes, and many show circular depressions. Theories about their purpose range from grave markers to fertility symbols to astronomical markers. Local communities maintain oral traditions connecting them to ancient warriors or ancestral spirits. The monoliths demonstrate that sophisticated stone-working cultures existed in southeastern Nigeria, challenging assumptions that West African civilizations worked exclusively in perishable materials like wood and clay. Many remain in situ in the forest, slowly being reclaimed by vegetation.",
    image: "/images/ikom-monoliths.jpg",
  },
  {
    id: 10,
    title: "Ade: Yoruba Beaded Crown",
    artist: "Yoruba Royal Craftspeople",
    year: "19th-20th Century",
    description:
      "Elaborate beaded crown worn by Yoruba kings (Oba), symbolizing divine authority and the connection between earthly and spiritual realms.",
    story:
      "The beaded crown, or 'ade', is the most important symbol of Yoruba kingship. Only kings descended from Oduduwa, the mythical founder of the Yoruba people, may wear these crowns. The veil of beads obscures the king's face, emphasizing that he represents divine authority rather than just an individual. Birds crown the top—usually the symbol of 'our mothers' (powerful elderly women and female ancestors) whose spiritual support legitimizes royal power. The inner cone contains powerful medicines and charms. When a new king is crowned, the ade literally contains the accumulated spiritual power (ase) of all previous rulers. Each crown is unique, custom-made for its wearer with colors and designs carrying specific symbolic meanings.",
    image: "/images/yoruba-beaded-crown.jpg",
  },
  {
    id: 11,
    title: "Urhobo Edjo Figure",
    artist: "Urhobo Artists (Niger Delta)",
    year: "19th-20th Century",
    description:
      "Wooden sculpture representing a water spirit (edjo) from Urhobo religious traditions in the Niger Delta region.",
    story:
      "The Urhobo people of the Niger Delta created powerful sculptures to house spirits and ancestors in shrine contexts. These edjo (spirit) figures often feature exaggerated features—bulging eyes, aggressive postures, elaborate scarification—designed to capture spiritual power rather than represent physical reality. Worshippers would pour libations, make offerings, and consult these figures during rituals. The dramatic, expressionistic style influenced European modernists like Picasso and Modigliani who saw African sculpture in Parisian ethnographic museums. However, while Europeans prized the 'primitive' aesthetic, for the Urhobo these were living spiritual beings requiring care and respect. Many sacred sculptures were sold or stolen during colonial disruption of traditional religious practices.",
    image: "/images/urhobo-figure.jpg",
  },
  {
    id: 12,
    title: "Bronze Leopard of Benin",
    artist: "Benin Kingdom Royal Bronze Casters Guild",
    year: "17th-18th Century",
    description:
      "Life-sized bronze leopard symbolizing the Oba's power and connection to the spiritual realm, displayed at the royal palace.",
    story:
      "Leopards held deep symbolic significance in Benin Kingdom—they represented the Oba's authority, ferocity in battle, and supernatural power. Pairs of bronze leopards flanked the Oba's throne and palace entrances, serving as guardians and symbols of royal might. The Guild of Bronze Casters held exclusive rights to create these royal commissions, passing techniques from master to apprentice. The intricate surface patterns of copper inlay work (representing spots) demonstrate the casters' extraordinary technical skill. After the 1897 British invasion, many of these leopards were looted and sold to museums and private collectors. Today, they're among the most recognizable and valuable artifacts from the Benin Kingdom, with ongoing debates about their rightful home.",
    image: "/images/benin-bronze-leopard.jpg",
  },
  {
    id: 13,
    title: "Ikenga: Personal God of Achievement",
    artist: "Igbo Artists",
    year: "19th-20th Century",
    description:
      "Personal altar figure representing individual achievement, strength, and determination in Igbo cosmology.",
    story:
      "In Igbo culture, each man owned an ikenga—a personal god residing in a carved wooden figure kept on a personal altar. The name translates roughly as 'place of strength' or 'right hand of accomplishment.' Before important endeavors, a man would make offerings to his ikenga, asking for success in farming, trading, or warfare. The figure typically features horns (representing aggression and power), holds a sword or machete (symbolic of achievement), and may hold a severed head (victory over enemies). When a man died, his ikenga might be buried with him or destroyed, as it was intimately tied to his individual life force. The tradition reflects Igbo values of personal agency, hard work, and individual responsibility for one's destiny.",
    image: "/images/ikenga-statue.jpg",
  },
  {
    id: 14,
    title: "Ekpe Society Mask",
    artist: "Efik/Ejagham Artists (Cross River)",
    year: "19th-20th Century",
    description:
      "Mask used in Ekpe (Leopard Society) ceremonies, representing one of the most powerful secret societies in southeastern Nigeria.",
    story:
      "The Ekpe society functioned as a powerful regulatory institution in Cross River communities, enforcing laws, collecting debts, and maintaining social order. Masked dancers embodying leopard spirits would appear during important ceremonies, their identity concealed to emphasize they represented spiritual rather than human authority. The society operated across ethnic boundaries, creating trade networks and diplomatic relationships throughout the region. Membership was hierarchical and expensive—only wealthy individuals could afford initiation into higher grades. The masks feature skin-covered wooden frames adorned with antelope horns, mirrors, feathers, and other symbolic materials. When colonial authorities tried to suppress Ekpe as 'pagan,' members adapted, and the society continues today as a cultural and social organization.",
    image: "/images/ekpe.jpg",
  },
  {
    id: 15,
    title: "Ila: The Marks of Identity",
    artist: "Contemporary Nigerian Photographer",
    year: "21st Century",
    description:
      "Photographic documentation of traditional Yoruba facial scarification marks, exploring identity and cultural heritage in modern Nigeria.",
    story:
      "Facial scarification (ila or ìlà) once served multiple purposes in Yoruba society: identification of ethnic sub-groups, marks of beauty, protection against evil spirits, and symbols of status. Different patterns indicated different towns or families—three vertical marks on each cheek identified Oyo people, while other patterns marked Egba, Ijebu, or other groups. During the slave trade era, these marks helped displaced people identify each other in diaspora communities. The practice declined dramatically in the 20th century as Western beauty standards spread and Nigeria modernized. Today, younger Nigerians rarely receive these marks, making elder generations living repositories of this tradition. Contemporary artists now document and reinterpret these marks through photography and digital art, preserving cultural memory while questioning what tradition means in the 21st century.",
    image: "/images/yoruba-tribal-marks.jpg",
  },
  {
    id: 16,
    title: "Tutu",
    artist: "Ben Enwonwu MBE",
    year: "1974",
    description:
      "Portrait of Adetutu Ademiluyi, an Ife princess, by Nigeria's most celebrated modern artist. Called the 'African Mona Lisa.'",
    story:
      "Ben Enwonwu (1917-1994) was Nigeria's first internationally recognized modern artist, trained at Goldsmiths and the Slade School in London. His portrait of Princess Tutu became legendary when it disappeared for decades, only to resurface in a London apartment in 2017 and sell at auction for £1.2 million—a record for modern African art at the time. Enwonwu painted three versions of Tutu; two remain missing. The work captures a pivotal moment in Nigerian history—painted shortly after the devastating Biafran War, it represented hope for national healing and reconciliation. Tutu herself was an Ife royal whose beauty became legendary. Enwonwu's style bridges traditional African aesthetics and European modernism, creating a distinctly Nigerian artistic voice that influenced generations of African artists.",
    image: "/images/tutu-painting.jpg",
  }
];
