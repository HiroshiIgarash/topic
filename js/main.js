
const app = new Vue({
    el: '#app',
    data: {
        deck: [],
        mark: ["♠", "♥", "♦", "♣"],
        cards: [],
        coin: 20000,
        bet: 1000,
        hands: {
            'Rfl': { odds: 500, ja: 'ロイヤルフラッシュ' },
            'stfl': { odds: 100, ja: 'ストレートフラッシュ' },
            'fourCard': { odds: 50, ja: 'フォー・オブ・ア・カインド' },
            'fullHouse': { odds: 10, ja: 'フルハウス' },
            'flush': { odds: 5, ja: 'フラッシュ' },
            'straight': { odds: 4, ja: 'ストレート' },
            'threeCard': { odds: 3, ja: 'スリー・オブ・ア・カインド' },
            'twoPair': { odds: 1, ja: 'ツーペア' },
            'onePair': { odds: 0, ja: 'ワンペア' },
            'highCard': { odds: 0, ja: 'ハイカード' },
        },
        phase: 'betting',
        messageFlag: false,
        message: 'おめでとうございます！ロイヤルストレートです！25000コイン獲得です！',
        focusCard: -1,
    },
    created() {
        this.createDeck(),
            this.giveCards()
    },
    mounted() {
        document.addEventListener('keydown', this.onKeyDown)
    },
    methods: {
        reset: function () {
            this.deck.length = 0;
            this.cards.length = 0;
            this.createDeck();
            this.giveCards();
            this.phase = 'betting';
            this.messageFlag = false;
            this.focusCard=-1;
            document.activeElement.blur();
        },
        createDeck: function () {
            for (let i = 0; i < 4; i++) {
                for (let j = 1; j <= 13; j++) {
                    let disp;
                    switch (j) {
                        case 1: {
                            disp = "A"
                            break;
                        }
                        case 11: {
                            disp = "J"
                            break;
                        }
                        case 12: {
                            disp = "Q"
                            break;
                        }
                        case 13: {
                            disp = "K"
                            break;
                        }
                        default: {
                            disp = j
                            break;
                        }
                    }
                    this.deck.push({
                        num: j,
                        disp: disp,
                        mark: this.mark[i],
                        ishold: false,
                    })
                }
            }
        },
        giveCards: function () {
            for (let i = 0; i < 5; i++) {
                let rand = Math.floor(Math.random() * this.deck.length);
                this.cards.push(this.deck[rand]);
                this.deck.splice(rand, 1)
            }
        },

        reGiveCards: function () {

            if (this.phase == 'betting') {
                //betする
                if (this.coin < this.bet) return;
                this.coin -= this.bet;
                this.phase = 'selecting';
            } else if (this.phase == 'selecting') {


                let alertflag = true;
                let allhold = true;
                let message = '';

                this.cards.forEach((card, index) => {
                    if (!card.ishold) {
                        let dir = 'up';
                        allhold = false;
                        const el = document.getElementById('card' + index);
                        el.classList.add('cardUp');
                        el.addEventListener('transitionend', () => {
                            if (dir == 'down') {
                                if (alertflag) {
                                    let hand = this.hands[this.rankCheck()];
                                    if (hand.odds == 0) {
                                        message = '残念でした！'
                                    } else {
                                        message = "おめでとうございます！\n" + hand.ja + "です！\n" + hand.odds * this.bet + "コインが当たりました！";
                                        document.getElementById(this.rankCheck()).classList.add('hit');
                                    }
                                    this.messageShow(message);
                                    // this.coin += this.hands[this.rankCheck()].odds * this.bet;
                                    alertflag = false;
                                    // this.reset();
                                }
                                return;
                            }
                            el.classList.remove('cardUp');
                            dir = 'down'
                            let rand = Math.floor(Math.random() * this.deck.length);
                            this.cards.splice(index, 1, this.deck[rand])
                            this.deck.splice(rand, 1)
                        });
                    }
                });
                if (allhold) {
                    let hand = this.hands[this.rankCheck()];
                    if (hand.odds == 0) {
                        message = '残念でした！'
                    } else {
                        message = "おめでとうございます！\n" + hand.ja + "です！\n" + hand.odds * this.bet + "コインが当たりました！";
                        document.getElementById(this.rankCheck()).classList.add('hit');
                    }
                    this.messageShow(message);
                    // this.messageShow(this.hands[this.rankCheck()].ja);
                    // this.coin += this.hands[this.rankCheck()].odds * this.bet;
                    // this.reset();
                }
            }
        },
        messageShow: function (message) {
            document.activeElement.blur();
            this.message = message
            this.messageFlag = true;
        },
        cardStyle: function (card) {
            let color;
            let opacity;
            switch (card.mark) {
                case "♠": {
                    color = "rgb(208,175,46)";
                    break;
                }
                case "♥": {
                    color = "rgb(160,104,101)";
                    break;
                }
                case "♦": {
                    color = "rgb(119,140,161)";
                    break;
                }
                case "♣": {
                    color = "rgb(64,107,48)";
                    break;
                }
            }
            if (this.phase == 'betting') opacity = 0;
            return { color: color, opacity: opacity }
        },
        clickCard: function (card) {
            if (this.phase != 'selecting') return;
            card.ishold = !card.ishold
        },
        clickMessage: function () {
            this.coin += this.hands[this.rankCheck()].odds * this.bet;
            if (this.coin > 9999999) this.coin == 9999999;
            document.getElementById(this.rankCheck()).classList.remove('hit');
            this.reset();
        },
        rankCheck: function () {
            //ここに役判定のコードを書く
            let numList = [];
            numList = this.cards.map(card => {
                return card.num;
            }).sort((a, b) => a - b)

            let pairs = [];
            let currentNum = 0;
            for (let i = 0; i < 4; i++) {
                if (numList[i] == numList[i + 1]) {
                    if (numList[i] == currentNum) {
                        pairs[pairs.length - 1]++
                    } else {
                        currentNum = numList[i]
                        pairs.push(2)
                    }
                }
            }

            function straitCheck() {
                if (JSON.stringify(numList) == JSON.stringify([1, 10, 11, 12, 13])) return true;
                for (let i = 0; i < 4; i++) {
                    if (numList[i] + 1 != numList[i + 1]) return false
                }
                return true;
            }

            if (JSON.stringify(numList) == JSON.stringify([1, 10, 11, 12, 13]) && this.cards.every(card => card.mark == this.cards[0].mark)) {
                return "Rfl"
            } else if (straitCheck() && this.cards.every(card => card.mark == this.cards[0].mark)) {
                return "stfl"
            } else if (JSON.stringify(pairs) == JSON.stringify([4])) {
                return "fourCard"
            } else if (JSON.stringify(pairs) == JSON.stringify([3, 2]) || JSON.stringify(pairs) == JSON.stringify([2, 3])) {
                return "fullHouse"
            } else if (this.cards.every(card => card.mark == this.cards[0].mark)) {
                return "flush"
            } else if (straitCheck()) {
                return "straight"
            } else if (JSON.stringify(pairs) == JSON.stringify([3])) {
                return "threeCard"
            } else if (JSON.stringify(pairs) == JSON.stringify([2, 2])) {
                return "twoPair"
            } else if (JSON.stringify(pairs) == JSON.stringify([2])) {
                return "onePair"
            } else return "highCard"
        },
        betUp: function () {
            if (this.phase != 'betting') return;
            if (this.bet + 1000 <= this.coin) {
                this.bet += 1000;
            }
        },
        betDown: function () {
            if (this.phase != 'betting') return;
            if (this.bet > 1000) {
                this.bet -= 1000;
            }
        },
        onKeyDown(event) {
            switch (event.keyCode) {
                case 32: { //スペースキー
                    if (this.messageFlag) {
                        this.clickMessage()
                    }else if(this.phase=='betting'){
                        this.reGiveCards();
                    } else if (this.phase == 'selecting') {
                        const el = document.activeElement;
                        console.log(el);
                        el.click();
                        // this.reGiveCards();
                    }
                    event.preventDefault();
                    break;
                }
                case 38: { //うえ矢印
                    this.betUp();
                    event.preventDefault();
                    break;
                }
                case 40: { //した矢印
                    this.betDown();
                    event.preventDefault();
                    break;
                }
                case 39: { //みぎ矢印
                    event.preventDefault();
                    if(this.messageFlag) return;
                    if (this.phase != 'selecting') return;
                    if (this.focusCard < 5) {
                        this.focusCard++;
                    } else {
                        this.focusCard = 0;
                    }
                    let id;
                    if (this.focusCard != 5) {
                        id = 'card' + this.focusCard;
                    } else {
                        id = 'btn';
                    }
                    const el = document.getElementById(id);
                    el.focus();
                    break;
                }
                case 37: { //ひだり矢印
                    event.preventDefault();
                    if(this.messageFlag) return;
                    if (this.phase != 'selecting') return;
                    if (this.focusCard > 0) {
                        this.focusCard--;
                    } else {
                        this.focusCard = 5;
                    }
                    let id;
                    if (this.focusCard != 5) {
                        id = 'card' + this.focusCard;
                    } else {
                        id = 'btn';
                    }
                    const el = document.getElementById(id);
                    el.focus();
                    break;
                }
            }
        }

    }
})