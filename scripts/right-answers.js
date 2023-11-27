(function () {

    const RightAnswers = {
        userDara: null,
        rightAnswers: null,
        quiz: null,
        userResult: null,
        init () {

            this.userDara = checkUserData();
            const testId = +sessionStorage.getItem('chooseQuizId');
            this.userResult = JSON.parse(sessionStorage.getItem('userResult'));
            if (testId) {
                const xhr = new XMLHttpRequest();
                xhr.open('GET', 'https://testologia.site/get-quiz-right?id=' + testId, false);
                xhr.send();

                if (xhr.status === 200 && xhr.responseText) {
                    try {
                        this.rightAnswers = JSON.parse(xhr.responseText);
                    } catch (e) {
                        location.href = 'index.html';
                    }
                } else {
                    location.href = 'index.html';
                }

                xhr.open('GET', 'https://testologia.site/get-quiz?id=' + testId, false);
                xhr.send();
                if (xhr.status === 200 && xhr.responseText) {
                    try {
                        this.quiz = JSON.parse(xhr.responseText);
                    } catch (e) {
                        location.href = 'index.html';
                    }
                    document.getElementById('right-answers-pre-title').innerText = `${this.quiz.name}`;
                    if (this.userDara) {
                        document.getElementById('author').innerHTML = `Тест выполнил <span>${this.userDara.name} ${this.userDara.lastName}, ${this.userDara.email}</span>`
                    }
                    if (this.userResult) {
                        this.showAnswers();
                    } else {
                        location.href = 'index.html';
                    }

                } else {
                    location.href = 'index.html';
                }
            }

        },

        showAnswers () {
            const answersElement = document.getElementById('answers');

            this.quiz.questions.forEach( (item, index) => {
                const rightAnswersBlock = document.createElement('div');
                rightAnswersBlock.className = 'right-answers-block';

                const rightAnswersBlockTitle = document.createElement('div');
                rightAnswersBlockTitle.className = 'common-question-title';
                rightAnswersBlockTitle.classList.add('right-answers-block-title');
                rightAnswersBlockTitle.innerHTML = `<span>Вопрос ${index + 1}:</span> ${item.question}`;

                const rightAnswersBlockOptions = document.createElement('div');
                rightAnswersBlockOptions.className = 'common-question-options';
                rightAnswersBlockOptions.classList.add('right-answers-block-options');

                let rightAnswerNumber = this.rightAnswers.filter( (itemAnswer, indexAnswer) => indexAnswer === index)[0];
                let userAnswerNumber = this.userResult.filter( userAnswer => userAnswer.questionId === item.id)[0];

                item.answers.forEach( answer => {
                    const answerElement = document.createElement('div');
                    answerElement.className = 'common-question-option';
                    answerElement.classList.add('right-answers-block-option');
                    if (userAnswerNumber && userAnswerNumber.chosenAnswerId === rightAnswerNumber && userAnswerNumber.chosenAnswerId === answer.id) {
                        answerElement.classList.add('right');
                    } else if (userAnswerNumber && userAnswerNumber.chosenAnswerId !== rightAnswerNumber && userAnswerNumber.chosenAnswerId === answer.id) {
                        answerElement.classList.add('wrong');
                    }
                    answerElement.innerText = `${answer.answer}`;
                    rightAnswersBlockOptions.appendChild(answerElement);
                })
                rightAnswersBlock.appendChild(rightAnswersBlockTitle);
                rightAnswersBlock.appendChild(rightAnswersBlockOptions);

                answersElement.appendChild(rightAnswersBlock);
            })


        }


    }

    RightAnswers.init()


})()