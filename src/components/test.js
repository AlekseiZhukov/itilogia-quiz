import {UserDataFromSessionStorage} from "../utils/userDataFromSessionStorage.js";

export class Test {

    constructor() {
        this.quiz = null;
        this.titleQuestionElement = null;
        this.optionsElement = null;
        this.nextButtonElement = null;
        this.prevButtonElement = null;
        this.passButtonElement = null;
        this.progressBar = null;
        this.currentQuestionIndex = 1;
        this.userResult = [];
        this.testId = null;

        UserDataFromSessionStorage.checkUserData();

        this.testId = +sessionStorage.getItem('chooseQuizId');

        if (this.testId) {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', 'https://testologia.site/get-quiz?id=' + this.testId, false);
            xhr.send();

            if (xhr.status === 200 && xhr.responseText) {
                try {
                    this.quiz = JSON.parse(xhr.responseText);
                } catch (e) {
                    location.href = '#/';
                }
                this.startQuiz()
            } else {
                location.href = '#/';
            }

        } else {
            location.href = '#/';
        }
    }

    startQuiz() {

        this.titleQuestionElement = document.getElementById('id-title');
        this.optionsElement = document.getElementById('options');

        this.nextButtonElement = document.getElementById('next');
        this.nextButtonElement.onclick = this.move.bind(this, 'next')

        this.passButtonElement = document.getElementById('pass');
        this.passButtonElement.onclick = this.move.bind(this, 'pass')

        this.prevButtonElement = document.getElementById('prev');
        this.prevButtonElement.onclick = this.move.bind(this, 'prev');

        document.getElementById('pre-title').innerText = this.quiz.name;

        this.progressBar = document.getElementById('progress-bar');

        this.prepareProgressBar();
        this.showQuestion();

        const timerElement = document.getElementById('timer');
        let seconds = 59;
        const interval = setInterval(function () {
            seconds--;
            timerElement.innerText = String(seconds);

            if (seconds === 0) {
                clearInterval(interval);
                this.complete();
            }
        }.bind(this), 1000)
    }

    prepareProgressBar() {

        for (let i = 0; i < this.quiz.questions.length; i++) {
            const itemElement = document.createElement('div');
            itemElement.className = 'test-progress-bar-item ' + (i === 0 ? 'active' : '');

            const itemCircleElement = document.createElement('div');
            itemCircleElement.className = 'test-progress-bar-item-circle';

            const itemTextElement = document.createElement('div');
            itemTextElement.className = 'test-progress-bar-item-text';
            itemTextElement.innerText = `Вопрос ${i + 1}`;

            itemElement.appendChild(itemCircleElement);
            itemElement.appendChild(itemTextElement);

            this.progressBar.appendChild(itemElement);
        }
    }

    showQuestion() {
        const activeQuestion = this.quiz.questions[this.currentQuestionIndex - 1];
        this.titleQuestionElement.innerHTML = `<span>Вопрос ${this.currentQuestionIndex}:</span> ${activeQuestion.question}`;
        this.optionsElement.innerHTML = '';
        const that = this;
        const chosenOption = this.userResult.find(item => item.questionId === activeQuestion.id);
        activeQuestion.answers.forEach(answer => {
            const optionElement = document.createElement('div');
            optionElement.className = 'common-question-option';

            const inputId = `answer-${answer.id}`;
            const inputElement = document.createElement('input');
            inputElement.className = 'option-answer';
            inputElement.setAttribute('type', 'radio');
            inputElement.setAttribute('id', inputId);
            inputElement.setAttribute('name', 'answer');
            inputElement.setAttribute('value', answer.id);
            if (chosenOption && chosenOption.chosenAnswerId === answer.id) {
                inputElement.setAttribute('checked', 'checked')
            }

            inputElement.onchange = function () {
                that.chooseAnswer();
            }

            const labelElement = document.createElement('label');
            labelElement.setAttribute('for', inputId);
            labelElement.innerText = answer.answer;

            optionElement.appendChild(inputElement);
            optionElement.appendChild(labelElement);

            this.optionsElement.appendChild(optionElement);
        });
        if (chosenOption && chosenOption.chosenAnswerId) {
            this.nextButtonElement.removeAttribute('disabled');
            this.passButtonElement.className = 'disabled';
            this.passButtonElement.firstElementChild.setAttribute('src', 'images/small-gray-arrow.png')

        } else {
            this.nextButtonElement.setAttribute('disabled', 'disabled');
            this.passButtonElement.className = '';
            this.passButtonElement.firstElementChild.setAttribute('src', 'images/small-arrow.png')
        }

        if (this.currentQuestionIndex === this.quiz.questions.length) {
            this.nextButtonElement.innerText = 'Завершить';
        } else {
            this.nextButtonElement.innerText = 'Далее';
        }

        if (this.currentQuestionIndex > 1) {
            this.prevButtonElement.removeAttribute('disabled');
        } else {
            this.prevButtonElement.setAttribute('disabled', 'disabled');
        }
    }

    chooseAnswer() {
        this.nextButtonElement.removeAttribute('disabled');
        this.passButtonElement.className = 'disabled';
        this.passButtonElement.firstElementChild.setAttribute('src', 'images/small-gray-arrow.png')
    }

    move(action) {
        const activeQuestion = this.quiz.questions[this.currentQuestionIndex - 1]
        const chosenAnswer = Array.from(document.getElementsByClassName('option-answer'))
            .find(elem => elem.checked);
        let chosenAnswerId = null;
        if (chosenAnswer && chosenAnswer.value) {
            chosenAnswerId = Number(chosenAnswer.value);
        }

        const existingResult = this.userResult.find(item => item.questionId === activeQuestion.id);
        if (existingResult) {
            existingResult.chosenAnswerId = chosenAnswerId;
        } else {
            this.userResult.push({
                questionId: activeQuestion.id,
                chosenAnswerId: chosenAnswerId
            })
        }

        if (action === 'next' || action === 'pass') {
            this.currentQuestionIndex++;
        } else {
            this.currentQuestionIndex--;
        }

        if (this.currentQuestionIndex > this.quiz.questions.length) {
            this.complete();
            return
        }


        Array.from(this.progressBar.children).forEach((item, index) => {
            const currentItemIndex = index + 1;
            item.classList.remove('complete');
            item.classList.remove('active');

            if (currentItemIndex === this.currentQuestionIndex) {
                item.classList.add('active');
            } else if (currentItemIndex < this.currentQuestionIndex) {
                item.classList.add('complete');
            }
        })
        this.showQuestion();
    }

    complete() {
        const userData = JSON.parse(sessionStorage.getItem('userData'));
        sessionStorage.setItem('userResult', JSON.stringify(this.userResult));
        sessionStorage.setItem('quiz', JSON.stringify(this.quiz))
        if (userData) {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', 'https://testologia.site/pass-quiz?id=' + this.testId, false);
            xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
            xhr.send(JSON.stringify({
                name: userData.name,
                lastName: userData.lastName,
                email: userData.email,
                results: this.userResult
            }));

            if (xhr.status === 200 && xhr.responseText) {
                let result = null;
                try {
                    result = JSON.parse(xhr.responseText);
                } catch (e) {
                    location.href = '#/';
                }
                if (result) {
                    sessionStorage.setItem('result', JSON.stringify({
                        score: result.score,
                        total: result.total
                    }));
                    location.href = '#/result';
                }
            } else {
                location.href = '#/';
            }
        }
    }
}
