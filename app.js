// Particle animation
const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const particles = [];
const particleCount = 180;

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

for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach((particle, i) => {
        particle.update();
        particle.draw();

        particles.slice(i + 1).forEach(otherParticle => {
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

    item.innerHTML = `
        <div class="item-header">
            <div class="item-main">
                <div class="item-title">${exp.role}</div>
                <div class="item-subtitle">${exp.company}</div>
                <div class="item-meta">
                    ${exp.type ? `<span class="item-type">${exp.type}</span> · ` : ''}
                    ${exp.duration}${exp.location ? ` · ${exp.location}` : ''}
                </div>
            </div>
        </div>
        ${hasDetails ? `
            <div class="item-details">
                <ul>
                    ${exp.details.map(detail => `<li>${detail}</li>`).join('')}
                </ul>
            </div>
        ` : ''}
    `;

    if (hasDetails) {
        const header = item.querySelector('.item-header');
        const details = item.querySelector('.item-details');

        header.addEventListener('click', () => {
            details.classList.toggle('expanded');
        });
    }

    return item;
}

function createEducationItem(edu) {
    const item = document.createElement('div');
    item.className = 'card-item';

    item.innerHTML = `
        <div class="item-main">
            <div class="item-title">${edu.school}</div>
            <div class="item-subtitle">${edu.degree}</div>
            <div class="item-meta">${edu.duration}</div>
        </div>
    `;

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
        item.innerHTML = `<div class="tool-list">${tool}</div>`;
    } else {
        const category = Object.keys(tool)[0];
        const items = tool[category];

        item.innerHTML = `
            <div class="tool-category">${category}</div>
            <div class="tool-list">${Array.isArray(items) ? items.join(', ') : items}</div>
        `;
    }

    return item;
}

loadData();
