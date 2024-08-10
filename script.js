document.addEventListener('DOMContentLoaded', () => {
    const startButton = document.getElementById('start-button');
    const quizContainer = document.getElementById('quiz-container');
    const startContainer = document.getElementById('start-container');
    const scoreContainer = document.getElementById('score-container');
    const questionElement = document.getElementById('question');
    const optionsElement = document.getElementById('options');
    const scoreElement = document.getElementById('score');
    const restartButton = document.getElementById('restart-button');
    const historyContainer =document.querySelector('#history-container');
    const historyList = document.getElementById('history-list');
    const conatiner=document.querySelector('.m-container');
    let currentQuestionIndex = 0;
    let questions = [];
    let score = 0;
    let history = [];

    startButton.addEventListener('click', () => {
        // Validate selections
        
        const category = document.getElementById('myselect').value;
        const level = document.getElementById('level').value;

        if (category === "" || level === "") {
            alert("Please select both a category and a difficulty level.");
        } else {
            
            startQuiz();
        }
    });

    restartButton.addEventListener('click', restartQuiz);

    function updateCurrentTime() {
        const currentTime = new Date();
        let hours = currentTime.getHours();
        const minutes = currentTime.getMinutes();
        const seconds = currentTime.getSeconds();
    
        // Determine AM or PM
        const ampm = hours >= 12 ? 'PM' : 'AM';
    
        // Convert hours from 24-hour to 12-hour format
        hours = hours % 12;
        hours = hours ? hours : 12; // The hour '0' should be '12'
    
        // Format minutes and seconds
        const minutesString = minutes.toString().padStart(2, '0');
        const secondsString = seconds.toString().padStart(2, '0');
    
        // Create time string
        const timeString = `${hours}:${minutesString}:${secondsString} ${ampm}`;
    
        // Update the time element
        document.getElementById('time').textContent = timeString;
    }
    

    setInterval(updateCurrentTime, 1000);

    function startQuiz() {
        startContainer.classList.add('d-none');
        quizContainer.classList.remove('d-none');
        scoreContainer.classList.add('d-none');
        score = 0;
        scoreElement.textContent = score;
        currentQuestionIndex = 0;
        conatiner.style.display='none';
        fetchQuestions();
    }

    function fetchQuestions() {
        const category = document.getElementById('myselect').value;
        
        const level = document.getElementById('level').value;
        questionElement.innerHTML=`<img src='loading.svg' width='56px' id='loading' style='margin-left:48%'>`;

        fetch(`https://opentdb.com/api.php?amount=10&category=${category}&difficulty=${level}&type=multiple`)
            .then(response => response.json())
            .then(data => {
                questions = data.results;
                if (questions.length > 0) {
                    displayQuestion(questions[currentQuestionIndex]);
                } else {
                    console.error('No questions are available');
                }
            })
            .catch(error => console.error('Error fetching quiz questions:', error));
    }

    function displayQuestion(question) {
        questionElement.innerHTML = question.question;

        optionsElement.innerHTML = '';
        const options = [...question.incorrect_answers, question.correct_answer];
        options.sort(() => Math.random() - 0.5);
        options.forEach(option => {
            const button = document.createElement('button');
            button.className = 'btn btn-secondary';
            button.style.margin = '5px';
            button.textContent = option;
            button.addEventListener('click', () => checkAnswer(button, option, question.correct_answer));
            optionsElement.appendChild(button);
        });
    }

    function checkAnswer(button, selectedOption, correctAnswer) {
        Array.from(optionsElement.children).forEach(btn => btn.disabled = true);

        if (selectedOption === correctAnswer) {
            button.classList.add('btn-success');
            score++;
            scoreElement.textContent = score;
            currentQuestionIndex++;
            if (currentQuestionIndex < questions.length) {
                setTimeout(() => displayQuestion(questions[currentQuestionIndex]), 1000);
            } else {
                setTimeout(endQuiz, 1000);
            }
        } else {
            button.classList.add('btn-danger');
            const correctButton = Array.from(optionsElement.children).find(btn => btn.textContent === correctAnswer);
            if (correctButton) {
                correctButton.classList.add('btn-success');
            }
            setTimeout(endQuiz, 1000);
        }
    }

    function endQuiz() {
        quizContainer.classList.add('d-none');
        scoreContainer.classList.remove('d-none');
        displayScoreMessage(score);
        storeHistory(score);
        historyContainer.style.display = "block";
        conatiner.style.display='block';
    }

    function displayScoreMessage(score) {
        if (score > 7) {
            alert( `Excellent try! Your score is ${score}. Try again!`);
        } else if (score > 4) {
            alert(`Good job! Your score is ${score}. Try again!`);
        } else {
            alert(`Your score is ${score}. Try again!`);
        }
    }

    function storeHistory(score) {
        const timestamp = new Date().toLocaleString();
        history.push({ score, timestamp });
        displayHistory();
    }

    function displayHistory() {
        historyList.innerHTML = '';
        history.forEach((attempt, index) => {
            const listItem = document.createElement('li');
            listItem.className = 'list-group-item d-flex justify-content-between align-items-center';
            listItem.innerHTML = `
                <span class="text-muted">Attempt ${index + 1}</span>
                <span class="badge badge-pill badge-success">score:${attempt.score}</span>
                <span class="text-muted">${attempt.timestamp}</span>
            `;
            const deleteButton = document.createElement('button');
            deleteButton.className = 'btn btn-sm btn-danger';
            deleteButton.textContent = 'Delete';
            deleteButton.addEventListener('click', () => {
                deleteAttempt(index);
            });
            listItem.appendChild(deleteButton);
            historyList.appendChild(listItem);
        });
    }

    function deleteAttempt(index) {
        history.splice(index, 1);
        displayHistory();
    }

    function restartQuiz() {
        startQuiz();
        historyContainer.style.display = "none";
    }
});
