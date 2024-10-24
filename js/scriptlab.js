const canvas = document.getElementById('waveCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 600;
canvas.height = 200;

let animationId;
let phase = 0;
let speed = 0.05;
let isReflecting = false;

// Function to draw transverse wave
function drawTransverseWave(wavelength, phaseShift, reflecting = false) {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas before drawing
    ctx.beginPath();
    for (let x = 0; x < canvas.width; x++) {
        const y = 100 + 50 * Math.sin((2 * Math.PI * (x + phaseShift)) / (wavelength * 100));
        ctx.lineTo(x, y);
    }
    ctx.stroke();

    // If reflecting, draw the reflection (inverted wave)
    if (reflecting) {
        ctx.beginPath();
        for (let x = canvas.width; x >= 0; x--) {
            const y = 100 - 50 * Math.sin((2 * Math.PI * (x + phaseShift)) / (wavelength * 100));
            ctx.lineTo(x, y);
        }
        ctx.stroke();
    }
}

// Function to update the wave based on user input
function updateWave() {
    const wavelength = parseFloat(document.getElementById('wavelength').value);
    if (!isNaN(wavelength) && wavelength > 0) {
        drawTransverseWave(wavelength, phase, isReflecting);
    } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas if wavelength is not valid
    }
}

// Function to animate the wave
function animateWave() {
    const wavelength = parseFloat(document.getElementById('wavelength').value);
    if (isNaN(wavelength) || wavelength <= 0) return; // Avoid animation if input is invalid
    function step() {
        drawTransverseWave(wavelength, phase, isReflecting);
        phase += speed; // Phase shift based on speed
        animationId = requestAnimationFrame(step);
    }
    animationId = requestAnimationFrame(step);
}

// Function to start the animation
function startAnimation() {
    const wavelength = parseFloat(document.getElementById('wavelength').value);
    const warning = document.getElementById('warning');
    
    if (!wavelength || isNaN(wavelength) || wavelength <= 0) {
        // Show the warning only when user presses the button with invalid wavelength
        warning.style.display = 'block';
        return; // Stop execution if the input is invalid
    }

    warning.style.display = 'none'; // Hide the warning if the input is valid
    if (!animationId) {
        animateWave();
        showEducationalInfo("The wave is in motion. Observe how the wave's crests and troughs move through the medium.");
    }
}

// Function to stop the animation
function stopAnimation() {
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
        showEducationalInfo("The wave has stopped. You can adjust the parameters and restart the simulation.");
    }
}

// Function to simulate wave reflection
function simulateReflection() {
    const wavelength = parseFloat(document.getElementById('wavelength').value);
    const warning = document.getElementById('warning');
    
    if (!wavelength || isNaN(wavelength) || wavelength <= 0) {
        // Show the warning only when user presses the button with invalid wavelength
        warning.style.display = 'block';
        return; // Stop execution if the input is invalid
    }

    warning.style.display = 'none'; // Hide the warning if the input is valid
    isReflecting = !isReflecting; // Toggle reflection
    updateWave(); // Re-draw the wave with/without reflection
    showEducationalInfo(isReflecting ? "Reflection enabled. The wave now behaves as if it hits a boundary and reflects back." : "Reflection disabled.");
}

// Function to calculate wave properties based on inputs
function calculateWave() {
    const lambda = parseFloat(document.getElementById('wavelength').value);
    const frequency = parseFloat(document.getElementById('frequency').value);
    const velocity = parseFloat(document.getElementById('velocity').value);

    let result = '';

    // If λ and f are provided, calculate v
    if (lambda && frequency) {
        const v = (lambda * frequency).toFixed(2);
        result = `Calculated Velocity (v): ${v} m/s`;
        document.getElementById('velocity').value = v;
    } 
    // If v and λ are provided, calculate f
    else if (lambda && velocity) {
        const f = (velocity / lambda).toFixed(2);
        result = `Calculated Frequency (f): ${f} Hz`;
        document.getElementById('frequency').value = f;
    } 
    // If v and f are provided, calculate λ
    else if (frequency && velocity) {
        const lambdaCalc = (velocity / frequency).toFixed(2);
        result = `Calculated Wavelength (λ): ${lambdaCalc} m`;
        document.getElementById('wavelength').value = lambdaCalc;
    }

    document.getElementById('result').innerText = result;

    // Update wave after calculation
    updateWave();
}

// Function to reset all inputs and canvas
function resetForm() {
    // Reset input fields
    document.getElementById('wavelength').value = '';
    document.getElementById('frequency').value = '';
    document.getElementById('velocity').value = '';
    document.getElementById('warning').style.display = 'none'; // Hide the warning on reset
    
    // Stop the animation if it's running
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height); 

    // Reset other states
    isReflecting = false;
    speed = 0.05;
    phase = 0;
    
    showEducationalInfo("All parameters have been reset. You can start a new simulation.");
}

// Function to show educational information
function showEducationalInfo(message) {
    document.getElementById('education').innerHTML = `<p>${message}</p>`;
}

// Function to check if buttons can be enabled
function checkInputs() {
    const wavelength = document.getElementById('wavelength').value;
    const reflectionBtn = document.getElementById('reflectionBtn');
    const startBtn = document.getElementById('startBtn');
    const stopBtn = document.getElementById('stopBtn');
    
    // Enable/disable the buttons based on the wavelength value
    if (!wavelength || isNaN(wavelength) || wavelength <= 0) {
        reflectionBtn.disabled = true;
        startBtn.disabled = true;
        stopBtn.disabled = true;
    } else {
        reflectionBtn.disabled = false;
        startBtn.disabled = false;
        stopBtn.disabled = false;
    }
}

// Update checkInputs call when wavelength input changes
document.getElementById('wavelength').addEventListener('input', checkInputs);
document.getElementById('wavelength').addEventListener('input', updateWave);
document.getElementById('frequency').addEventListener('input', updateWave);
document.getElementById('velocity').addEventListener('input', updateWave);

// Initialize wave on page load
updateWave();

// Initialize the input check on page load
checkInputs();

function startAnimation() {
    const wavelength = parseFloat(document.getElementById('wavelength').value);
    const warning = document.getElementById('warning');
    
    if (!wavelength || isNaN(wavelength) || wavelength <= 0) {
        warning.style.display = 'block';
        return;
    }

    warning.style.display = 'none';
    playSoundEffect();  // Tambahkan efek suara saat animasi dimulai
    if (!animationId) {
        animateWave();
    }
}

function playSoundEffect() {
    const audio = new Audio('sound/start-sound.wav'); // Tambahkan file suara di folder yang sesuai
    audio.play();
}
