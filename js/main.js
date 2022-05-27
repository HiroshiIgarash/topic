
const app = new Vue({
    el: '#app',
    data: {
        deck: [],
        mark: ["♠", "♥", "♦", "♣"],
        cards: [],
        coin: 6868,
        bet: 1000,
        odds:{
            'Rfl':500,
            'stfl':100,
            'fourCard':50,
            'fullHouse':10,
            'flush':5,
            'straight':4,
            'threeCard':3,
            'twoPair':1,
            'onePair':0,
            'highCard':0,
        }
    },
    created() {
        this.createDeck(),
            this.giveCards()
    },
    methods: {
        reset: function () {
            this.deck.length = 0;
            this.cards.length = 0;
            this.createDeck();
            this.giveCards();
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

            //betする
            if(this.coin<=this.bet) return;
            this.coin-=this.bet;

            let alertflag = true;
            let allhold = true;

            this.cards.forEach((card, index) => {
                if (!card.ishold) {
                    let dir = 'up';
                    allhold = false;
                    const el = document.getElementById('card' + index);
                    el.classList.add('cardUp');
                    el.addEventListener('transitionend', () => {
                        if (dir == 'down') {
                            if (alertflag) {
                                alert(this.rankCheck());
                                alertflag = false;
                                this.reset();
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
                alert(this.rankCheck());
                this.reset();
            }
        },
        cardStyle: function (card) {
            let color;
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
            return { color: color }
        },
        clickCard: function (card) {
            card.ishold = !card.ishold
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
                return "ロイヤルフラッシュ"
            } else if (straitCheck() && this.cards.every(card => card.mark == this.cards[0].mark)) {
                return "ストレートフラッシュ"
            } else if (JSON.stringify(pairs) == JSON.stringify([4])) {
                return "フォー・オブ・ア・カインド"
            } else if (JSON.stringify(pairs) == JSON.stringify([3, 2]) || JSON.stringify(pairs) == JSON.stringify([2, 3])) {
                return "フルハウス"
            } else if (this.cards.every(card => card.mark == this.cards[0].mark)) {
                return "フラッシュ"
            } else if (straitCheck()) {
                return "ストレート"
            } else if (JSON.stringify(pairs) == JSON.stringify([3])) {
                return "スリー・オブ・ア・カインド"
            } else if (JSON.stringify(pairs) == JSON.stringify([2, 2])) {
                return "ツーペア"
            } else if (JSON.stringify(pairs) == JSON.stringify([2])) {
                return "ワンペア"
            } else return "ハイカード"
        },
        betUp: function () {
            if(this.bet+1000<=this.coin){
                this.bet += 1000;
            }
        },
        betDown: function () {
            if(this.bet>1000){
                this.bet -= 1000;
            }
        }
    }
})