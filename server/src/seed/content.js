// seed/content.js
// All the learning content: 12 quizzes (challenges) and 12 interactive lessons.
// Physics, Chemistry, Biology and Maths for classes 8, 9 and 10.
// To add more, copy an entry and change the text. `sim` names must match client/src/simulations/index.js.

// q(question, [options], correctIndex, explanation)
const q = (text, options, correctIndex, explanation) => ({ text, options, correctIndex, explanation });

const challenges = [
  // ---------------- CLASS 8 ----------------
  { subject: 'Physics', grade: 8, title: 'Force and Pressure', difficulty: 'easy', xpReward: 50,
    description: 'Pressure, force and area.',
    questions: [
      q('Pressure is defined as...', ['Force acting per unit area', 'Force multiplied by area', 'Mass per unit volume', 'Work done per second'], 0, 'Pressure = Force ÷ Area.'),
      q('What is the SI unit of pressure?', ['Newton', 'Pascal', 'Joule', 'Watt'], 1, '1 pascal (Pa) = 1 newton per square metre (N/m²).'),
      q('Why does a sharp knife cut better than a blunt one?', ['It is heavier', 'The same force acts on a smaller area, giving more pressure', 'It is made of softer metal', 'It has less force'], 1, 'A smaller area means higher pressure for the same force.'),
      q('A force of 100 N acts on an area of 0.5 m². The pressure is...', ['50 Pa', '200 Pa', '100.5 Pa', '20 Pa'], 1, 'P = F ÷ A = 100 ÷ 0.5 = 200 Pa.'),
    ] },
  { subject: 'Chemistry', grade: 8, title: 'Combustion and Flame', difficulty: 'easy', xpReward: 50,
    description: 'What makes things burn, and how fires are put out.',
    questions: [
      q('Which three things make up the fire triangle?', ['Fuel, oxygen and heat', 'Water, air and heat', 'Fuel, water and oxygen', 'Smoke, heat and wood'], 0, 'Remove any one of them and the fire goes out.'),
      q('Which extinguisher is suitable for an electrical fire?', ['Water', 'Carbon dioxide extinguisher', 'A wet cloth', 'Kerosene'], 1, 'Water conducts electricity, so CO₂ is used for electrical fires.'),
      q('The lowest temperature at which a substance catches fire is its...', ['Boiling point', 'Melting point', 'Ignition temperature', 'Freezing point'], 2, 'Petrol has a very low ignition temperature, so it catches fire easily.'),
      q('Which zone of a candle flame is the hottest?', ['Innermost zone', 'Middle luminous zone', 'Outermost zone', 'All zones are equally hot'], 2, 'In the outermost zone combustion is complete, so it is the hottest.'),
    ] },
  { subject: 'Biology', grade: 8, title: 'Cell: The Basic Unit of Life', difficulty: 'easy', xpReward: 50,
    description: 'Cells, organelles and their jobs.',
    questions: [
      q('Who first observed cells?', ['Robert Hooke', 'Gregor Mendel', 'Charles Darwin', 'Louis Pasteur'], 0, 'Robert Hooke saw cells in a slice of cork in 1665.'),
      q('Which organelle is the control centre of the cell?', ['Vacuole', 'Nucleus', 'Cell wall', 'Chloroplast'], 1, 'The nucleus holds the DNA that directs the cell.'),
      q('Which organelle is called the powerhouse of the cell?', ['Ribosome', 'Mitochondrion', 'Nucleus', 'Vacuole'], 1, 'Mitochondria release energy from food during respiration.'),
      q('Which part is found in plant cells but not in animal cells?', ['Nucleus', 'Cell wall', 'Cell membrane', 'Cytoplasm'], 1, 'Plant cells have a rigid cell wall (and chloroplasts).'),
    ] },
  { subject: 'Maths', grade: 8, title: 'Algebraic Identities', difficulty: 'easy', xpReward: 50,
    description: 'Expanding and using identities.',
    questions: [
      q('(a + b)² equals...', ['a² + b²', 'a² + 2ab + b²', 'a² − 2ab + b²', '2a + 2b'], 1, 'The middle term 2ab is easy to forget.'),
      q('(x + 3)² equals...', ['x² + 9', 'x² + 6x + 9', 'x² + 3x + 9', 'x² + 6x + 6'], 1, 'x² + 2(x)(3) + 3² = x² + 6x + 9.'),
      q('(a − b)² equals...', ['a² − b²', 'a² + 2ab + b²', 'a² − 2ab + b²', 'a² − 2ab − b²'], 2, 'The sign of the middle term changes, but b² stays positive.'),
      q('Using an identity, 102² is...', ['10204', '10404', '10004', '10424'], 1, '(100 + 2)² = 10000 + 400 + 4 = 10404.'),
    ] },

  // ---------------- CLASS 9 ----------------
  { subject: 'Physics', grade: 9, title: 'Motion', difficulty: 'medium', xpReward: 60,
    description: 'Speed, velocity and distance-time graphs.',
    questions: [
      q('Speed is given by...', ['Distance ÷ time', 'Time ÷ distance', 'Distance × time', 'Distance + time'], 0, 'Speed = distance ÷ time.'),
      q('A car travels 120 km in 2 hours. Its average speed is...', ['240 km/h', '60 km/h', '122 km/h', '30 km/h'], 1, '120 ÷ 2 = 60 km/h.'),
      q('Which quantity has both magnitude and direction?', ['Speed', 'Distance', 'Velocity', 'Time'], 2, 'Velocity is a vector; speed is not.'),
      q('A straight line parallel to the time axis on a distance-time graph means the object is...', ['Moving at constant speed', 'At rest', 'Speeding up', 'Moving backwards'], 1, 'The distance is not changing, so the object is at rest.'),
    ] },
  { subject: 'Chemistry', grade: 9, title: 'Structure of the Atom', difficulty: 'medium', xpReward: 60,
    description: 'Protons, neutrons, electrons and shells.',
    questions: [
      q('Which particle carries a negative charge?', ['Proton', 'Neutron', 'Electron', 'Nucleus'], 2, 'Electrons are negative, protons are positive, neutrons are neutral.'),
      q('The atomic number of an element equals the number of its...', ['Neutrons', 'Protons', 'Electrons plus neutrons', 'Shells'], 1, 'Atomic number Z = number of protons.'),
      q('An atom has 6 protons and 6 neutrons. Its mass number is...', ['6', '12', '18', '0'], 1, 'Mass number = protons + neutrons = 12.'),
      q('What is the maximum number of electrons in the first (K) shell?', ['2', '8', '18', '1'], 0, 'The K shell holds up to 2 electrons.'),
    ] },
  { subject: 'Biology', grade: 9, title: 'Diffusion and Osmosis', difficulty: 'medium', xpReward: 60,
    description: 'How substances move in and out of cells.',
    questions: [
      q('The movement of water across a selectively permeable membrane is called...', ['Osmosis', 'Respiration', 'Digestion', 'Evaporation'], 0, 'Osmosis is the diffusion of water through a membrane.'),
      q('A dried raisin swells in water because...', ['Water moves into it by osmosis', 'It makes its own water', 'Air enters it', 'Its sugar disappears'], 0, 'The raisin has a higher solute concentration than the water around it.'),
      q('Which structure controls what enters and leaves the cell?', ['Cell wall', 'Plasma membrane', 'Nucleus', 'Mitochondrion'], 1, 'The plasma (cell) membrane is selectively permeable.'),
      q('Which organelle makes proteins?', ['Ribosome', 'Vacuole', 'Chloroplast', 'Cell wall'], 0, 'Ribosomes are the protein factories of the cell.'),
    ] },
  { subject: 'Maths', grade: 9, title: 'Linear Equations in Two Variables', difficulty: 'medium', xpReward: 60,
    description: 'Solutions and graphs of linear equations.',
    questions: [
      q('The graph of a linear equation in two variables is...', ['A circle', 'A straight line', 'A parabola', 'A point'], 1, 'All the solutions lie on one straight line.'),
      q('Which pair is a solution of x + y = 5?', ['(1, 3)', '(2, 3)', '(4, 2)', '(0, 0)'], 1, '2 + 3 = 5.'),
      q('What is the equation of the x-axis?', ['x = 0', 'y = 0', 'x = y', 'x + y = 0'], 1, 'Every point on the x-axis has y = 0.'),
      q('The line y = 3x − 2 cuts the y-axis at...', ['(0, 2)', '(0, −2)', '(−2, 0)', '(3, 0)'], 1, 'Put x = 0: y = −2.'),
    ] },

  // ---------------- CLASS 10 ----------------
  { subject: 'Physics', grade: 10, title: 'Electricity and Ohm\'s Law', difficulty: 'hard', xpReward: 70,
    description: 'Current, voltage, resistance and circuits.',
    questions: [
      q('Ohm\'s law states that...', ['V = I ÷ R', 'V = I × R', 'V = R ÷ I', 'V = I + R'], 1, 'Voltage = current × resistance.'),
      q('A 12 V battery is connected to a 4 Ω resistor. The current is...', ['48 A', '3 A', '8 A', '0.33 A'], 1, 'I = V ÷ R = 12 ÷ 4 = 3 A.'),
      q('The SI unit of resistance is the...', ['Ampere', 'Volt', 'Ohm', 'Watt'], 2, 'Resistance is measured in ohms (Ω).'),
      q('In a series circuit, the current is...', ['The same through every component', 'Largest in the first component', 'Shared equally by dividing it', 'Zero in the wires'], 0, 'There is only one path, so the same current flows through every component.'),
    ] },
  { subject: 'Chemistry', grade: 10, title: 'Acids, Bases and Salts', difficulty: 'hard', xpReward: 70,
    description: 'pH, indicators and neutralisation.',
    questions: [
      q('The pH of a neutral solution is...', ['0', '7', '10', '14'], 1, 'Below 7 is acidic and above 7 is basic.'),
      q('Which turns blue litmus paper red?', ['An acid', 'A base', 'Pure water', 'A salt solution'], 0, 'Acids turn blue litmus red.'),
      q('Acid + base gives...', ['Salt + water', 'Salt + hydrogen', 'Only water', 'Another acid'], 0, 'This is called a neutralisation reaction.'),
      q('HCl + NaOH gives...', ['NaCl + H₂O', 'NaH + Cl₂', 'Na₂O + HCl', 'H₂ + NaClO'], 0, 'Sodium chloride (common salt) and water.'),
    ] },
  { subject: 'Biology', grade: 10, title: 'Heredity: Mendel\'s Experiments', difficulty: 'hard', xpReward: 70,
    description: 'Dominant and recessive traits, and sex determination.',
    questions: [
      q('Who is known as the Father of Genetics?', ['Gregor Mendel', 'Robert Hooke', 'Louis Pasteur', 'Charles Darwin'], 0, 'Mendel experimented on pea plants.'),
      q('In a cross Tt × Tt, what fraction of the offspring are dwarf (tt)?', ['1/2', '1/4', '3/4', 'None'], 1, 'The offspring are TT, Tt, Tt and tt, so 1 in 4 is tt.'),
      q('A trait that shows up in the F1 generation when two contrasting parents are crossed is...', ['Dominant', 'Recessive', 'Mutated', 'Extinct'], 0, 'The trait that hides in F1 is recessive.'),
      q('Which sex chromosomes does a human male have?', ['XX', 'XY', 'YY', 'XO'], 1, 'Females have XX and males have XY.'),
    ] },
  { subject: 'Maths', grade: 10, title: 'Quadratic Equations', difficulty: 'hard', xpReward: 70,
    description: 'Roots, factorising and the discriminant.',
    questions: [
      q('A quadratic equation has the form...', ['ax + b = 0', 'ax² + bx + c = 0, a ≠ 0', 'ax³ + b = 0', 'a/x + b = 0'], 1, 'The highest power of x is 2.'),
      q('The discriminant of ax² + bx + c = 0 is...', ['b² − 4ac', 'b² + 4ac', '4ac − b', '2ab'], 0, 'D = b² − 4ac.'),
      q('The roots of x² − 5x + 6 = 0 are...', ['2 and 3', '−2 and −3', '1 and 6', '5 and 1'], 0, '(x − 2)(x − 3) = 0.'),
      q('If the discriminant is negative, the equation has...', ['Two real roots', 'Equal roots', 'No real roots', 'Infinite roots'], 2, 'The parabola does not meet the x-axis.'),
    ] },
];

const check = (question, options, correctIndex, explanation) => ({ type: 'check', question, options, correctIndex, explanation });
const text = (title, body) => ({ type: 'text', title, body });
const sim = (name) => ({ type: 'sim', sim: name });
const reveal = (prompt, answer) => ({ type: 'reveal', prompt, answer });

// Each lesson links to the quiz with the same subject, grade and title (see seed.js)
const lessons = [
  { subject: 'Physics', grade: 8, title: 'Force and Pressure', summary: 'Why a sharp knife cuts and a wide strap is comfortable.', order: 1, xpReward: 30,
    blocks: [
      text('What is pressure?', 'When you push on something, that push is a force. Pressure tells us how concentrated the force is. Pressure = Force ÷ Area. Force is measured in newtons (N) and area in square metres (m²), so pressure is measured in pascals (Pa).'),
      sim('pressure'),
      check('You press a drawing pin into a board with the same force. Which end makes more pressure?', ['The blunt head (large area)', 'The sharp tip (small area)', 'Both are the same'], 1, 'The same force on a smaller area gives more pressure, so the sharp tip goes in.'),
      text('Pressure in daily life', 'Knives are sharpened and nails have pointed tips to create high pressure. Wide tyres and the broad feet of a camel spread the weight over a large area, so the pressure is low and they do not sink into soft ground.'),
      check('A wide school-bag strap is more comfortable than a thin one because it...', ['Reduces the pressure by spreading the force over a larger area', 'Increases the force on your shoulder', 'Makes the bag lighter'], 0, 'Larger area means smaller pressure.'),
      reveal('Try this: a 60 N force acts on an area of 0.3 m². What is the pressure?', 'P = F ÷ A = 60 ÷ 0.3 = 200 Pa.'),
    ] },
  { subject: 'Chemistry', grade: 8, title: 'Combustion and Flame', summary: 'Put out the fire by removing fuel, oxygen or heat.', order: 1, xpReward: 30,
    blocks: [
      text('What is combustion?', 'Combustion is a chemical process in which a substance reacts with oxygen and gives out heat and light. A substance that burns is called a fuel. To burn, three things are needed together: fuel, oxygen (air) and enough heat. This is the fire triangle.'),
      sim('fire'),
      check('Which of these puts out a small fire by cutting off the air?', ['Covering it with a blanket', 'Adding more wood', 'Blowing on it'], 0, 'A blanket stops oxygen from reaching the fuel.'),
      text('Ignition temperature', 'The lowest temperature at which a substance catches fire is its ignition temperature. Petrol has a very low ignition temperature, so it must be kept away from flames. Water puts out most fires because it cools the fuel below its ignition temperature. But water must not be used on electrical fires or oil fires.'),
      check('Why should water not be used on an electrical fire?', ['Water can conduct electricity and cause shocks', 'Water is too cold', 'Water burns'], 0, 'Use a carbon dioxide extinguisher instead.'),
      reveal('A candle flame has three zones. Which one is the hottest?', 'The outermost zone, where combustion is complete. The innermost zone (unburnt wax vapour) is the least hot.'),
    ] },
  { subject: 'Biology', grade: 8, title: 'Cell: The Basic Unit of Life', summary: 'Explore plant and animal cells part by part.', order: 1, xpReward: 30,
    blocks: [
      text('Everything is made of cells', 'All living things are made of cells. Robert Hooke first saw cells in a thin slice of cork in 1665 using a microscope. Some organisms, like amoeba, have a single cell. Others, like humans, have trillions.'),
      sim('cell'),
      check('Which organelle is called the control centre of the cell?', ['Nucleus', 'Vacuole', 'Cell wall'], 0, 'The nucleus contains DNA, which controls the cell\'s activities.'),
      text('Plant cell vs animal cell', 'Both have a nucleus, cytoplasm, a cell membrane and mitochondria. Plant cells also have a rigid cell wall, chloroplasts for photosynthesis, and usually one large central vacuole.'),
      check('Which part is present in plant cells but NOT in animal cells?', ['Cell wall', 'Nucleus', 'Cell membrane'], 0, 'Switch the simulation to Plant cell to see the extra parts.'),
      reveal('Why is the mitochondrion called the powerhouse of the cell?', 'It releases energy from food during respiration, and the cell uses that energy for its activities.'),
    ] },
  { subject: 'Maths', grade: 8, title: 'Algebraic Identities', summary: 'See (a + b)² as an area and use it for quick sums.', order: 1, xpReward: 30,
    blocks: [
      text('An identity is always true', 'An identity is an equation that is true for every value of its variables. The most useful one is (a + b)² = a² + 2ab + b². Move the sliders below and watch the square break into four pieces.'),
      sim('identity'),
      check('(x + 4)² equals...', ['x² + 16', 'x² + 8x + 16', 'x² + 4x + 16'], 1, 'x² + 2(x)(4) + 4² = x² + 8x + 16.'),
      text('More identities', '(a − b)² = a² − 2ab + b². (a + b)(a − b) = a² − b². Use them to calculate fast: 99² = (100 − 1)² = 10000 − 200 + 1 = 9801.'),
      check('Using (a + b)(a − b) = a² − b², what is 51 × 49?', ['2499', '2401', '2599'], 0, '(50 + 1)(50 − 1) = 2500 − 1 = 2499.'),
      reveal('Expand (2x + 3)².', '(2x)² + 2(2x)(3) + 3² = 4x² + 12x + 9.'),
    ] },

  { subject: 'Physics', grade: 9, title: 'Motion', summary: 'Speed, distance and time with a moving car.', order: 1, xpReward: 30,
    blocks: [
      text('Speed, distance and time', 'An object is in motion if its position changes with time. Speed tells us how fast: Speed = Distance ÷ Time, so Distance = Speed × Time. It is measured in metres per second (m/s) or kilometres per hour (km/h).'),
      sim('motion'),
      check('A cyclist moves at 5 m/s for 10 s. How far does she travel?', ['2 m', '15 m', '50 m', '500 m'], 2, 'Distance = 5 × 10 = 50 m.'),
      text('Speed and velocity', 'Speed has only magnitude. Velocity also has a direction, so two cars going at 60 km/h in opposite directions have the same speed but different velocities. In uniform motion an object covers equal distances in equal intervals of time.'),
      check('On a distance-time graph, a straight sloping line shows...', ['An object at rest', 'Uniform speed', 'Zero speed'], 1, 'The distance grows by equal amounts in equal times.'),
      reveal('Try this: a train covers 180 km in 3 hours. What is its average speed?', 'Speed = 180 ÷ 3 = 60 km/h.'),
    ] },
  { subject: 'Chemistry', grade: 9, title: 'Structure of the Atom', summary: 'Build atoms of the first 18 elements.', order: 1, xpReward: 30,
    blocks: [
      text('What is inside an atom?', 'An atom has a nucleus containing protons (positive) and neutrons (no charge). Electrons (negative) move around the nucleus in shells. A neutral atom has equal numbers of protons and electrons.'),
      text('Numbers that describe an atom', 'The atomic number Z is the number of protons. The mass number A is protons + neutrons. Electrons fill shells in order. For the first 18 elements the pattern is 2, 8, 8: the first shell holds 2 electrons, the second 8, and the third is filled with up to 8.'),
      sim('atom'),
      check('Sodium has atomic number 11. How many electrons does a neutral sodium atom have?', ['1', '11', '23'], 1, 'Neutral atoms have as many electrons as protons.'),
      check('Chlorine has 17 protons. How many electrons are in its outer (third) shell?', ['7', '8', '2'], 0, 'The shells fill 2, 8, then 7.'),
      reveal('Why is neon (2, 8) so unreactive?', 'Its outer shell is completely full, which makes the atom stable. The same is true of helium and argon.'),
    ] },
  { subject: 'Biology', grade: 9, title: 'Diffusion and Osmosis', summary: 'Watch a cell swell and shrink.', order: 1, xpReward: 30,
    blocks: [
      text('Moving in and out', 'The cell membrane is selectively permeable: it lets some substances pass and blocks others. Diffusion is the movement of particles from a region of higher concentration to lower concentration. Osmosis is the diffusion of water through a selectively permeable membrane.'),
      sim('osmosis'),
      check('Water moves into a cell placed in pure water because the cell contents are...', ['More concentrated than the surrounding water', 'More dilute than the surrounding water', 'Exactly the same as the surrounding water'], 0, 'Water moves toward the side with the higher solute concentration.'),
      text('Three kinds of solution', 'In a hypotonic solution (less concentrated than the cell) the cell swells. In an isotonic solution (same concentration) there is no net movement of water. In a hypertonic solution (more concentrated) the cell shrinks. A dried raisin swells in water, and a fresh grape shrinks in strong salt water.'),
      check('An animal cell is placed in a very concentrated salt solution. It will...', ['Swell', 'Shrink', 'Stay the same'], 1, 'Water leaves the cell by osmosis.'),
      reveal('Why does water appear on cucumber slices when you sprinkle salt on them?', 'The salt makes the outside more concentrated, so water moves out of the cells by osmosis.'),
    ] },
  { subject: 'Maths', grade: 9, title: 'Linear Equations in Two Variables', summary: 'Draw lines by changing slope and intercept.', order: 1, xpReward: 30,
    blocks: [
      text('Equations make lines', 'A linear equation in two variables, such as y = 2x + 1, has infinitely many solutions (pairs of x and y). When you plot all those pairs, they form a straight line.'),
      sim('line'),
      check('In y = mx + c, what does c tell us?', ['Where the line cuts the y-axis', 'How steep the line is', 'Where the line cuts the x-axis'], 0, 'When x = 0, y = c.'),
      text('Slope', 'm is the slope (steepness). A larger m gives a steeper line, and a negative m makes the line fall from left to right. In class 9 you also meet the form ax + by + c = 0, which is the same line written differently.'),
      check('Is (1, 3) a solution of y = 2x + 1?', ['Yes', 'No'], 0, '2(1) + 1 = 3, so the point lies on the line.'),
      reveal('Find y when x = 4 in 3x + y = 10.', '3(4) + y = 10, so y = 10 − 12 = −2.'),
    ] },

  { subject: 'Physics', grade: 10, title: 'Electricity and Ohm\'s Law', summary: 'Change voltage and resistance and watch the current.', order: 1, xpReward: 30,
    blocks: [
      text('Current, voltage and resistance', 'Electric current (I) is the flow of charge and is measured in amperes (A). Potential difference or voltage (V) pushes the charge around the circuit and is measured in volts (V). Resistance (R) opposes the flow and is measured in ohms (Ω).'),
      text('Ohm\'s law', 'At constant temperature, the current through a conductor is directly proportional to the potential difference across it: V = I × R, so I = V ÷ R. Try it below.'),
      sim('ohm'),
      check('The voltage stays the same and the resistance is doubled. The current becomes...', ['Double', 'Half', 'The same'], 1, 'I = V ÷ R, so doubling R halves I.'),
      check('A 6 V battery is connected to a 3 Ω resistor. The current is...', ['18 A', '2 A', '0.5 A'], 1, 'I = 6 ÷ 3 = 2 A.'),
      reveal('Why can a rheostat change the brightness of a bulb?', 'It changes the resistance in the circuit, which changes the current, so the bulb gets brighter or dimmer.'),
    ] },
  { subject: 'Chemistry', grade: 10, title: 'Acids, Bases and Salts', summary: 'Slide along the pH scale and see the colour change.', order: 1, xpReward: 30,
    blocks: [
      text('Acids and bases', 'Acids taste sour and turn blue litmus red (lemon juice, vinegar). Bases feel soapy and turn red litmus blue (baking soda solution, soap). The pH scale runs from 0 to 14: below 7 is acidic, 7 is neutral and above 7 is basic.'),
      sim('ph'),
      check('A solution has a pH of 3. It is...', ['Acidic', 'Neutral', 'Basic'], 0, 'Anything below 7 is acidic.'),
      text('Neutralisation', 'When an acid reacts with a base they cancel each other: acid + base → salt + water. For example, hydrochloric acid + sodium hydroxide → sodium chloride + water (HCl + NaOH → NaCl + H₂O).'),
      check('Which products form in a neutralisation reaction?', ['Salt and water', 'Salt and hydrogen', 'An acid and a base'], 0, 'Salt and water.'),
      reveal('Why is toothpaste basic?', 'Bacteria in the mouth make acids that damage tooth enamel. A basic toothpaste neutralises that acid.'),
    ] },
  { subject: 'Biology', grade: 10, title: 'Heredity: Mendel\'s Experiments', summary: 'Cross pea plants with a Punnett square.', order: 1, xpReward: 30,
    blocks: [
      text('Mendel and his peas', 'Heredity is the passing of traits from parents to offspring. Gregor Mendel studied pea plants. When he crossed a tall plant with a dwarf plant, all the F1 offspring were tall. Tall is the dominant trait and dwarf is the recessive trait.'),
      text('Genes in pairs', 'Each trait is controlled by a pair of genes, one from each parent. T stands for tall (dominant) and t for dwarf (recessive). A plant is tall if it has at least one T. Crossing two Tt plants gives 3 tall : 1 dwarf in the next generation. Choose the parents below.'),
      sim('punnett'),
      check('A plant with genes tt will be...', ['Tall', 'Dwarf', 'Either'], 1, 'It has no dominant T gene.'),
      check('Cross TT × tt. All the offspring are...', ['Tt, and tall', 'tt, and dwarf', 'TT, and tall'], 0, 'Each parent gives one gene: T from one and t from the other.'),
      reveal('What decides whether a baby is a boy or a girl?', 'Women have XX and men have XY. The father\'s sperm carries either X or Y. X gives a girl (XX) and Y gives a boy (XY).'),
    ] },
  { subject: 'Maths', grade: 10, title: 'Quadratic Equations', summary: 'Move a parabola and watch its roots appear.', order: 1, xpReward: 30,
    blocks: [
      text('What is a quadratic equation?', 'A quadratic equation has the form ax² + bx + c = 0 where a ≠ 0. Its graph is a U-shaped curve called a parabola. The x-values where the curve cuts the x-axis are the roots (solutions).'),
      text('The discriminant', 'D = b² − 4ac tells us about the roots. If D > 0 there are two different real roots. If D = 0 the two roots are equal and the curve just touches the x-axis. If D < 0 there are no real roots. The roots are x = (−b ± √D) ÷ 2a.'),
      sim('parabola'),
      check('For x² − 4x + 4 = 0, what is D?', ['0', '8', '−8'], 0, 'D = 16 − 16 = 0, so the roots are equal (x = 2).'),
      check('If D is negative, the parabola...', ['Cuts the x-axis twice', 'Does not meet the x-axis', 'Touches the x-axis once'], 1, 'There are no real roots.'),
      reveal('Solve x² − 5x + 6 = 0 by factorising.', '(x − 2)(x − 3) = 0, so x = 2 or x = 3.'),
    ] },
];

module.exports = { challenges, lessons };
