// Particle animation
const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const particles = [];
const particleCount = 180;

// Spatial optimization: Grid-based particle management
const gridSize = 150; // Should be larger than connection distance (120)
const grid = new Map();

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
        ctx.fillStyle = 'rgba(99, 102, 241, 0.6)';
        ctx.fill();
    }
}

// Spatial optimization helper functions
function getGridKey(x, y) {
    const gridX = Math.floor(x / gridSize);
    const gridY = Math.floor(y / gridSize);
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
    const centerX = Math.floor(particle.x / gridSize);
    const centerY = Math.floor(particle.y / gridSize);

    // Check 9 grid cells (3x3 around the particle)
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

for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update all particles first
    particles.forEach(particle => {
        particle.update();
    });

    // Update spatial grid
    updateGrid();

    // Draw particles and connections using optimized algorithm
    particles.forEach((particle, i) => {
        particle.draw();

        // Get nearby particles using spatial optimization
        const nearbyParticles = getNearbyParticles(particle);

        // Only check distance for nearby particles
        nearbyParticles.forEach(otherParticle => {
            // Skip self and avoid duplicate connections
            if (otherParticle === particle) return;

            const dx = particle.x - otherParticle.x;
            const dy = particle.y - otherParticle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 120) {
                ctx.beginPath();
                ctx.strokeStyle = `rgba(99, 102, 241, ${0.4 * (1 - distance / 120)})`;
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

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

async function loadData() {
    try {
        const response = await fetch('data.yaml');
        const yamlText = await response.text();
        const data = jsyaml.load(yamlText);
        populatePage(data);
    } catch (error) {
        // Site still functions with empty sections
    }
}

function populatePage(data) {
    if (!data) return;

    if (data.name) document.getElementById('name').textContent = data.name;
    if (data.title) document.getElementById('title').textContent = data.title;
    if (data.tagline) document.getElementById('tagline').textContent = data.tagline;

    if (data.contact) {
        const contactDiv = document.getElementById('contact');
        Object.entries(data.contact).forEach(([key, value]) => {
            const link = document.createElement('a');
            link.href = key === 'email' ? `mailto:${value}` : `https://${value}`;
            link.textContent = value;
            link.target = '_blank';
            contactDiv.appendChild(link);
        });
    }

    if (data.experience && data.experience.length > 0) {
        const experienceList = document.getElementById('experience-list');
        data.experience.forEach(exp => {
            const item = createTimelineItem(exp);
            experienceList.appendChild(item);
        });
    }

    if (data.education && data.education.length > 0) {
        const educationList = document.getElementById('education-list');
        data.education.forEach(edu => {
            const item = createEducationItem(edu);
            educationList.appendChild(item);
        });
    }

    if (data.skills && data.skills.length > 0) {
        const skillsList = document.getElementById('skills-list');
        data.skills.forEach(skill => {
            const item = createSkillItem(skill);
            skillsList.appendChild(item);
        });
    }

    if (data.tools && data.tools.length > 0) {
        const toolsList = document.getElementById('tools-list');
        data.tools.forEach(tool => {
            const item = createToolItem(tool);
            toolsList.appendChild(item);
        });
    }
}

function createTimelineItem(exp) {
    const item = document.createElement('div');
    const hasDetails = exp.details && exp.details.length > 0;

    item.className = hasDetails ? 'timeline-item' : 'timeline-item no-details';

    // Create item header
    const itemHeader = document.createElement('div');
    itemHeader.className = 'item-header';

    const itemMain = document.createElement('div');
    itemMain.className = 'item-main';

    const itemTitle = document.createElement('div');
    itemTitle.className = 'item-title';
    itemTitle.textContent = exp.role;

    const itemSubtitle = document.createElement('div');
    itemSubtitle.className = 'item-subtitle';
    itemSubtitle.textContent = exp.company;

    const itemMeta = document.createElement('div');
    itemMeta.className = 'item-meta';

    // Build meta content safely
    let metaContent = '';
    if (exp.type) {
        metaContent += exp.type + ' · ';
    }
    metaContent += exp.duration;
    if (exp.location) {
        metaContent += ' · ' + exp.location;
    }
    itemMeta.textContent = metaContent;

    // Assemble header
    itemMain.appendChild(itemTitle);
    itemMain.appendChild(itemSubtitle);
    itemMain.appendChild(itemMeta);
    itemHeader.appendChild(itemMain);
    item.appendChild(itemHeader);

    // Create details section if needed
    if (hasDetails) {
        const itemDetails = document.createElement('div');
        itemDetails.className = 'item-details';

        const detailsList = document.createElement('ul');
        exp.details.forEach(detail => {
            const listItem = document.createElement('li');
            listItem.textContent = detail;
            detailsList.appendChild(listItem);
        });

        itemDetails.appendChild(detailsList);
        item.appendChild(itemDetails);

        // Add click handler for expand/collapse
        itemHeader.addEventListener('click', () => {
            itemDetails.classList.toggle('expanded');
        });
    }

    return item;
}

function createEducationItem(edu) {
    const item = document.createElement('div');
    item.className = 'card-item';

    const itemMain = document.createElement('div');
    itemMain.className = 'item-main';

    const itemTitle = document.createElement('div');
    itemTitle.className = 'item-title';
    itemTitle.textContent = edu.school;

    const itemSubtitle = document.createElement('div');
    itemSubtitle.className = 'item-subtitle';
    itemSubtitle.textContent = edu.degree;

    const itemMeta = document.createElement('div');
    itemMeta.className = 'item-meta';
    itemMeta.textContent = edu.duration;

    itemMain.appendChild(itemTitle);
    itemMain.appendChild(itemSubtitle);
    itemMain.appendChild(itemMeta);
    item.appendChild(itemMain);

    return item;
}

function createSkillItem(skill) {
    const item = document.createElement('div');
    item.className = 'skill-item';
    item.textContent = skill;
    return item;
}

function createToolItem(tool) {
    const item = document.createElement('div');
    item.className = 'tool-item';

    if (typeof tool === 'string') {
        const toolList = document.createElement('div');
        toolList.className = 'tool-list';
        toolList.textContent = tool;
        item.appendChild(toolList);
    } else {
        const category = Object.keys(tool)[0];
        const items = tool[category];

        const toolCategory = document.createElement('div');
        toolCategory.className = 'tool-category';
        toolCategory.textContent = category;

        const toolList = document.createElement('div');
        toolList.className = 'tool-list';
        toolList.textContent = Array.isArray(items) ? items.join(', ') : items;

        item.appendChild(toolCategory);
        item.appendChild(toolList);
    }

    return item;
}

loadData();
