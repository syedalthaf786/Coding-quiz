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

    let currentQuestionIndex = 0;
    let questions = [];
    let score = 0;
    let history = [];
    startButton.addEventListener('click', startQuiz);
    restartButton.addEventListener('click', restartQuiz);
    
    function updateCurrentTime() {
      const currentTime = new Date();
      const hours = currentTime.getHours();
      const minutes = currentTime.getMinutes();
      const seconds = currentTime.getSeconds();
      const timeString = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
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
        fetchQuestions();
    }

    function fetchQuestions() {
        fetch('https://opentdb.com/api.php?amount=10&category=18&type=multiple') 
            .then(response => response.json())
            .then(data => {
                questions = data.results;
                displayQuestion(questions[currentQuestionIndex]);
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
            button.style.margin = '5px'
            button.textContent = option;
            button.addEventListener('click', () => checkAnswer(button, option, question.correct_answer));
            optionsElement.appendChild(button);
        });
    }

    function checkAnswer(button, selectedOption, correctAnswer) {
       
        Array.from(optionsElement.children).forEach(btn => btn.disabled = true);

        if (selectedOption === correctAnswer) {
            button.classList.add('btn-success'); // Add success class to correct button
            score++;
            scoreElement.textContent = score;
            currentQuestionIndex++;
            if (currentQuestionIndex < questions.length) {
                setTimeout(() => displayQuestion(questions[currentQuestionIndex]), 1000); // Display next question after 1 second
            } else {
                setTimeout(endQuiz, 1000); // End quiz after 1 second
            }
        } else {
            button.classList.add('btn-danger'); // Add danger class to wrong button
            const correctButton = Array.from(optionsElement.children).find(btn => btn.textContent === correctAnswer);
            if (correctButton) {
                correctButton.classList.add('btn-success'); // Highlight correct answer
            }
            setTimeout(endQuiz, 1000); // End quiz after 1 second
        }
    }

    function endQuiz() {
        quizContainer.classList.add('d-none');
        scoreContainer.classList.remove('d-none');
        displayScoreMessage(score);
        storeHistory(score);
        historyContainer.style.display="block";
    }

    function displayScoreMessage(score) {
        if (score > 20) {
            scoreElement.innerHTML = `Excellent try! Your score is ${score}. Try again!`;
        } else if (score > 15) {
            scoreElement.innerHTML = `Good job! Your score is ${score}. Try again!`;
        } else {
            scoreElement.innerHTML = `Your score is ${score}. Try again!`;
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
            <span class="badge badge-pill badge-success">${attempt.score}</span>
            <span class="text-muted">${attempt.timestamp}</span>
          `;
          // const detailsButton = document.createElement('button');
          // detailsButton.className = 'btn btn-sm btn-info';
          // detailsButton.textContent = 'Details';
          // detailsButton.addEventListener('click', () => {
          //   showDetails(index);
          // });
          // listItem.appendChild(detailsButton);
      
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
        historyContainer.style.display="none";
    }
});