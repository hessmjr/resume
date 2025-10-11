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
        ctx.fillStyle = 'rgba(99, 102, 241, 0.3)';
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
                ctx.strokeStyle = `rgba(99, 102, 241, ${0.15 * (1 - distance / 120)})`;
                ctx.lineWidth = 1;
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

    if (data.certifications && data.certifications.length > 0) {
        const certList = document.getElementById('certifications-list');
        data.certifications.forEach(cert => {
            const item = createCertificationItem(cert);
            certList.appendChild(item);
        });
    }

    if (data.skills && data.skills.length > 0) {
        const skillsList = document.getElementById('skills-list');
        data.skills.forEach(skill => {
            const item = createSkillItem(skill);
            skillsList.appendChild(item);
        });
    }

    if (data.hobbies && data.hobbies.length > 0) {
        const hobbiesList = document.getElementById('hobbies-list');
        data.hobbies.forEach(hobby => {
            const item = createHobbyItem(hobby);
            hobbiesList.appendChild(item);
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
            ${hasDetails ? '<span class="expand-icon">▼</span>' : ''}
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
        const icon = item.querySelector('.expand-icon');

        header.addEventListener('click', () => {
            details.classList.toggle('expanded');
            icon.classList.toggle('expanded');
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

function createCertificationItem(cert) {
    const item = document.createElement('div');
    item.className = 'card-item';

    item.innerHTML = `
        <div class="item-main">
            <div class="item-title">${cert.title}</div>
            <div class="item-subtitle">${cert.issuer}</div>
            <div class="item-meta">
                ${cert.platform ? `${cert.platform} · ` : ''}
                ${cert.issued}
                ${cert.credentialId ? ` · ${cert.credentialId}` : ''}
            </div>
        </div>
    `;

    return item;
}

function createSkillItem(skill) {
    const item = document.createElement('div');
    item.className = 'skill-item';

    if (typeof skill === 'string') {
        item.innerHTML = `<div class="skill-list">${skill}</div>`;
    } else {
        item.innerHTML = `
            <div class="skill-category">${skill.category}</div>
            <div class="skill-list">${Array.isArray(skill.items) ? skill.items.join(', ') : skill.items}</div>
        `;
    }

    return item;
}

function createHobbyItem(hobby) {
    const item = document.createElement('div');
    item.className = 'hobby-item';
    item.textContent = hobby;
    return item;
}

loadData();
