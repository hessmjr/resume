const PARTICLE_COUNT = 180;
const GRID_SIZE = 150;
const CONNECTION_DISTANCE = 120;
const PARTICLE_COLOR = 'rgba(99, 102, 241, 0.6)';
const CONNECTION_COLOR = 'rgba(99, 102, 241, 0.4)';

const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Spatial optimization: Grid-based particle management for O(n) collision detection
const grid = new Map();
const particles = [];

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.radius = Math.random() * 2;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = PARTICLE_COLOR;
        ctx.fill();
    }
}

function getGridKey(x, y) {
    const gridX = Math.floor(x / GRID_SIZE);
    const gridY = Math.floor(y / GRID_SIZE);
    return `${gridX},${gridY}`;
}

function updateGrid() {
    grid.clear();
    particles.forEach(particle => {
        const key = getGridKey(particle.x, particle.y);
        if (!grid.has(key)) {
            grid.set(key, []);
        }
        grid.get(key).push(particle);
    });
}

function getNearbyParticles(particle) {
    const nearbyParticles = [];
    const centerX = Math.floor(particle.x / GRID_SIZE);
    const centerY = Math.floor(particle.y / GRID_SIZE);

    // Check 9 grid cells (3x3 around the particle) for collision detection
    for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
            const key = `${centerX + dx},${centerY + dy}`;
            const cellParticles = grid.get(key);
            if (cellParticles) {
                nearbyParticles.push(...cellParticles);
            }
        }
    }

    return nearbyParticles;
}

for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push(new Particle());
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(particle => {
        particle.update();
    });

    updateGrid();

    particles.forEach((particle, i) => {
        particle.draw();

        const nearbyParticles = getNearbyParticles(particle);

        nearbyParticles.forEach(otherParticle => {
            if (otherParticle === particle) return;

            const dx = particle.x - otherParticle.x;
            const dy = particle.y - otherParticle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < CONNECTION_DISTANCE) {
                ctx.beginPath();
                // Dynamic opacity based on distance for visual depth
                const opacity = 0.4 * (1 - distance / CONNECTION_DISTANCE);
                ctx.strokeStyle = `rgba(99, 102, 241, ${opacity})`;
                ctx.lineWidth = 1.5;
                ctx.moveTo(particle.x, particle.y);
                ctx.lineTo(otherParticle.x, otherParticle.y);
                ctx.stroke();
            }
        });
    });

    requestAnimationFrame(animate);
}

animate();

function handleResize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function initializeEventListeners() {
    window.addEventListener('resize', handleResize);
}

function initializeApp() {
    initializeEventListeners();
    loadData();
}

async function loadData() {
    try {
        const response = await fetch('data.yaml');

        if (!response.ok) {
            throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
        }

        const yamlText = await response.text();

        if (!yamlText.trim()) {
            console.warn('data.yaml file is empty');
            return;
        }

        const data = jsyaml.load(yamlText);

        if (!data) {
            console.warn('Failed to parse YAML data');
            return;
        }

        populatePage(data);
        console.log('Resume data loaded successfully');

    } catch (error) {
        console.error('Error loading resume data:', error);
        // Graceful degradation: site functions with empty sections
    }
}

function populatePage(data) {
    if (!data) {
        console.warn('No data provided to populatePage');
        return;
    }

    // Safe DOM manipulation with error handling
    function setTextContent(elementId, text) {
        const element = document.getElementById(elementId);
        if (element && text) {
            element.textContent = text;
        } else if (!element) {
            console.warn(`Element with id '${elementId}' not found`);
        }
    }

    setTextContent('name', data.name);
    setTextContent('title', data.title);
    setTextContent('tagline', data.tagline);

    if (data.contact) {
        const contactDiv = document.getElementById('contact');
        if (!contactDiv) {
            console.warn('Contact div not found');
            return;
        }

        Object.entries(data.contact).forEach(([key, value]) => {
            if (!value) return;

            const link = createElement('a', '', value);
            // Auto-generate appropriate URLs based on contact type
            link.href = key === 'email' ? `mailto:${value}` : `https://${value}`;
            link.target = '_blank';
            contactDiv.appendChild(link);
        });
    }

    // reusable list population with error handling
    function populateList(listId, data, createItemFunction) {
        if (!data || data.length === 0) return;

        const listElement = document.getElementById(listId);
        if (!listElement) {
            console.warn(`Element with id '${listId}' not found`);
            return;
        }

        data.forEach(item => {
            const element = createItemFunction(item);
            listElement.appendChild(element);
        });
    }

    populateList('experience-list', data.experience, createTimelineItem);
    populateList('education-list', data.education, createEducationItem);
    populateList('skills-list', data.skills, createSkillItem);
    populateList('tools-list', data.tools, createToolItem);
}

// reduces repetitive DOM creation
function createElement(tag, className, textContent = '') {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (textContent) element.textContent = textContent;
    return element;
}

// Reusable header structure for timeline and education items
function createItemHeader(title, subtitle, meta) {
    const itemHeader = createElement('div', 'item-header');
    const itemMain = createElement('div', 'item-main');

    const itemTitle = createElement('div', 'item-title', title);
    const itemSubtitle = createElement('div', 'item-subtitle', subtitle);
    const itemMeta = createElement('div', 'item-meta', meta);

    itemMain.appendChild(itemTitle);
    itemMain.appendChild(itemSubtitle);
    itemMain.appendChild(itemMeta);
    itemHeader.appendChild(itemMain);

    return itemHeader;
}

function createTimelineItem(exp) {
    const item = createElement('div');
    const hasDetails = exp.details && exp.details.length > 0;

    item.className = hasDetails ? 'timeline-item' : 'timeline-item no-details';

    let metaContent = '';
    if (exp.type) {
        metaContent += exp.type + ' · ';
    }
    metaContent += exp.duration;
    if (exp.location) {
        metaContent += ' · ' + exp.location;
    }

    const itemHeader = createItemHeader(exp.role, exp.company, metaContent);
    item.appendChild(itemHeader);

    if (hasDetails) {
        const itemDetails = createElement('div', 'item-details');
        const detailsList = createElement('ul');

        exp.details.forEach(detail => {
            const listItem = createElement('li', '', detail);
            detailsList.appendChild(listItem);
        });

        itemDetails.appendChild(detailsList);
        item.appendChild(itemDetails);

        // Interactive expand/collapse functionality
        itemHeader.addEventListener('click', () => {
            itemDetails.classList.toggle('expanded');
        });
    }

    return item;
}

function createEducationItem(edu) {
    const item = createElement('div', 'card-item');
    const itemHeader = createItemHeader(edu.school, edu.degree, edu.duration);
    item.appendChild(itemHeader);
    return item;
}

function createSkillItem(skill) {
    return createElement('div', 'skill-item', skill);
}

function createToolItem(tool) {
    const item = createElement('div', 'tool-item');

    if (typeof tool === 'string') {
        const toolList = createElement('div', 'tool-list', tool);
        item.appendChild(toolList);
    } else {
        // Handle categorized tools (object format)
        const category = Object.keys(tool)[0];
        const items = tool[category];

        const toolCategory = createElement('div', 'tool-category', category);
        const toolList = createElement('div', 'tool-list', Array.isArray(items) ? items.join(', ') : items);

        item.appendChild(toolCategory);
        item.appendChild(toolList);
    }

    return item;
}

initializeApp();
