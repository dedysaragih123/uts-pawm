const canvas = document.getElementById('waveCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 600;
canvas.height = 200;

let animationId;
let phase = 0;
let speed = 0.05;
let isReflecting = false;

function drawTransverseWave(wavelength, phaseShift, reflecting = false) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    for (let x = 0; x < canvas.width; x++) {
        const y = 100 + 50 * Math.sin((2 * Math.PI * (x + phaseShift)) / (wavelength * 100));
        ctx.lineTo(x, y);
    }
    ctx.stroke();

    if (reflecting) {
        ctx.beginPath();
        for (let x = canvas.width; x >= 0; x--) {
            const y = 100 - 50 * Math.sin((2 * Math.PI * (x + phaseShift)) / (wavelength * 100));
            ctx.lineTo(x, y);
        }
        ctx.stroke();
    }
}

function updateWave() {
    const wavelength = parseFloat(document.getElementById('wavelength').value);
    if (!isNaN(wavelength) && wavelength > 0) {
        drawTransverseWave(wavelength, phase, isReflecting);
    } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height); 
    }
}

function animateWave() {
    const wavelength = parseFloat(document.getElementById('wavelength').value);
    if (isNaN(wavelength) || wavelength <= 0) return; 
    function step() {
        drawTransverseWave(wavelength, phase, isReflecting);
        phase += speed;
        animationId = requestAnimationFrame(step);
    }
    animationId = requestAnimationFrame(step);
}

function startAnimation() {
    const wavelength = parseFloat(document.getElementById('wavelength').value);
    const warning = document.getElementById('warning');
    
    if (!wavelength || isNaN(wavelength) || wavelength <= 0) {
        warning.style.display = 'block';
        return; 
    }

    warning.style.display = 'none';
    if (!animationId) {
        animateWave();
        showEducationalInfo("The wave is in motion. Observe how the wave's crests and troughs move through the medium.");
    }
}

function stopAnimation() {
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
        showEducationalInfo("The wave has stopped. You can adjust the parameters and restart the simulation.");
    }
}

function simulateReflection() {
    const wavelength = parseFloat(document.getElementById('wavelength').value);
    const warning = document.getElementById('warning');
    
    if (!wavelength || isNaN(wavelength) || wavelength <= 0) {
        warning.style.display = 'block';
        return; 
    }

    warning.style.display = 'none'; 
    isReflecting = !isReflecting;
    updateWave(); 
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

    updateWave();
}

function resetForm() {
    document.getElementById('wavelength').value = '';
    document.getElementById('frequency').value = '';
    document.getElementById('velocity').value = '';
    document.getElementById('warning').style.display = 'none'; 
    
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height); 

    isReflecting = false;
    speed = 0.05;
    phase = 0;
    
    showEducationalInfo("All parameters have been reset. You can start a new simulation.");
}

function showEducationalInfo(message) {
    document.getElementById('education').innerHTML = `<p>${message}</p>`;
}

function checkInputs() {
    const wavelength = document.getElementById('wavelength').value;
    const reflectionBtn = document.getElementById('reflectionBtn');
    const startBtn = document.getElementById('startBtn');
    const stopBtn = document.getElementById('stopBtn');
    
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

document.getElementById('wavelength').addEventListener('input', checkInputs);
document.getElementById('wavelength').addEventListener('input', updateWave);
document.getElementById('frequency').addEventListener('input', updateWave);
document.getElementById('velocity').addEventListener('input', updateWave);

updateWave();
checkInputs();

function playSoundEffect() {
    const audio = new Audio('sound/start-sound.wav'); 
    audio.play();
}

document.addEventListener("DOMContentLoaded", () => {
    checkQuizSubmissionStatus();
});

function checkQuizSubmissionStatus() {
    fetch('/api/quiz/check-submission?quiz_id=1')  // Sesuaikan `quiz_id` sesuai kebutuhan
        .then(response => response.json())
        .then(data => {
            const submitButton = document.getElementById("submitQuizButton");
            if (data.submitted && submitButton) {
                submitButton.disabled = true; // Nonaktifkan tombol jika sudah submit
            }
        })
        .catch(error => console.error("Error checking quiz submission status:", error));
}

function submitQuiz() {
    let score = 0;
    const userAnswers = [];

    quizQuestions.forEach((item, index) => {
        const userAnswer = parseFloat(document.getElementById(`answer-${index}`).value);

        if (userAnswer === item.answer) {
            score += 20;
        }

        userAnswers.push({ question: item.question, userAnswer });
    });

    document.getElementById("quiz-score").innerHTML = `Your Score: ${score}/100`;

    saveQuizScore(score, userAnswers);
}

function saveQuizScore(score, userAnswers) {
    const quizId = 1;  // Pastikan ini sesuai dengan quiz_id yang valid di database
    const submitButton = document.getElementById("submitQuizButton");

    fetch('/api/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            quiz_id: quizId,
            score: score,
            user_answers: userAnswers
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert(data.error);
            if (data.error === "You have already submitted this quiz") {
                if (submitButton) submitButton.disabled = true; // Nonaktifkan tombol jika sudah submit
            }
        } else {
            alert("Quiz score saved successfully!");
            if (submitButton) submitButton.disabled = true; // Nonaktifkan tombol setelah submit berhasil
        }
    })
    .catch(error => console.error('Error saving quiz score:', error));
}

function exitQuiz() {
    document.getElementById("simulation-section").style.display = "block";
    document.getElementById("warning").style.display = "block";
    document.getElementById("result").style.display = "block";
    document.getElementById("education").style.display = "block";
    document.querySelector(".btn-home").style.display = "block";

    document.getElementById("quiz-section").style.display = "none";
    document.getElementById("quiz-score").innerHTML = "";
    progress = 0;
    updateProgressBar();

    // Tambahkan pengecekan status quiz submission
    checkQuizSubmissionStatus();
}
