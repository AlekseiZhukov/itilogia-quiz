export class Result {

    constructor() {
        const result = JSON.parse(sessionStorage.getItem('result'))
        const score = result.score.toString();
        const total = result.total.toString();

        if (score && total) {
            document.getElementById('result-score').innerText = `${score}/${total}`;
        } else {
            location.href = '#/';
        }

        document.getElementById('right-answers').onclick = this.goToRightAnswers
    }

    goToRightAnswers() {
        location.href = '#/right-answers';
    }
}
