var User = new Phaser.Class({
  Extends: Phaser.Scene,
  initialize: function User() {
    Phaser.Scene.call(this, {
      key: 'user'
    });
  },
  preload: function () {
    this.load.html('userForm', 'html/scenes/user/form.html');
    this.load.audio('music', ['sounds/game-music.mp3']);
    this.load.image('logo200x132', 'images/logo-200x132-white.png');
    this.load.image('personLaptop77x100', 'images/person-laptop-77x100.png');
    this.load.image('personBike60x79', 'images/person-bike-60x79.png');
    this.load.image('backgroundUser', 'images/bg-scene-user.jpg');
  },
  create: function () {
    this.sound.removeAll();
    var music = this.sound.add('music', {
      loop: true,
      volume: 0.2
    }).play();
    this.add.image(400, 214, 'backgroundUser');
    this.add.image(250, 210, 'personLaptop77x100');
    this.add.image(400, 150, 'logo200x132');
    var personMotion = this.add.image(0, 390, 'personBike60x79');
    const tween = this.add.tween({
      targets: personMotion,
      x: 1500,
      duration: 20000,
      yoyo: false,
      ease: 'Linear',
      repeat: -1
    });
    this.add.dom(380, 280).setInteractive().createFromCache('userForm');
    document.querySelector('.btnUser').addEventListener('click', () => {
      var nameUser = document.querySelector('.nameUser');
      if (nameUser.value !== '') {
        this.scene.start('info', {
          name: nameUser.value
        });
      }
    });
  }
});
var Info = new Phaser.Class({
  Extends: Phaser.Scene,
  initialize: function Info() {
    Phaser.Scene.call(this, {
      key: 'info'
    });
  },
  init: function (data) {
    this.name = data.name;
  },
  preload: function () {
    this.load.image('backgroundInfo', 'images/bg-scene-info.jpg');
    this.load.image('logo100x66', 'images/logo-100x66-white.png');
    this.load.html('infoBriefing', 'html/scenes/info/briefing.html');
  },
  create: function () {
    this.add.image(400, 214, 'backgroundInfo');
    this.add.image(400, 50, 'logo100x66');
    this.add.text(27, 40, 'Bem-vindo(a),', {
      fontFamily: "'Courier New', Courier, monospace",
      fontSize: 20,
      color: '#ffffff',
      fontWeight: 'bold'
    });
    this.add.text(27, 60, this.name + '!', {
      fontFamily: "'Courier New', Courier, monospace",
      fontSize: 30,
      color: '#fab40a'
    });
    this.add.dom(400, 250).setInteractive().createFromCache('infoBriefing');
    document.querySelector('.btnInfo').addEventListener('click', () => {
      this.scene.start('game', {
        name: this.name
      });
    });
  }
});
var Game = new Phaser.Class({
  Extends: Phaser.Scene,
  initialize: function Game() {
    Phaser.Scene.call(this, {
      key: 'game'
    });
  },
  init: function (data) {
    this.name = data.name;
    this.initialCountdownTime = 180; //segundos
    this.lifes = 3;
    this.questionsCorrects = 0;
    this.questionsIds = [];
    this.questionsJson = {};
    this.currentQuestion = null;
    this.gameEnd = false;
    this.helpBox = false;
    this.infoBox = false;
    this.finished = false;
  },
  preload: function () {
    this.input.keyboard.enabled = true;
    this.load.json('questionsJson', 'js/questions.json');
    this.load.audio("sGameOver", ["sounds/game-over.mp3"]);
    this.load.audio("sGameSuccess", ["sounds/game-success.mp3"]);
    this.load.audio("sQuestionCorrect", ["sounds/question-correct.mp3"]);
    this.load.audio("sQuestionIncorrect", ["sounds/question-incorrect.mp3"]);
    this.load.audio("sQuestionTime", ["sounds/question-time.mp3"]);
    this.load.html('gameOver', 'html/scenes/game/game-over.html');
    this.load.html('gameFinished', 'html/scenes/game/finished.html');
    this.load.html('gameHelp', 'html/scenes/game/help.html');
    this.load.html('gameInfo', 'html/scenes/game/info.html');
    this.load.html('gameScore', 'html/scenes/game/score.html');
    this.load.html('gameEe1', 'html/scenes/game/ee1.html');
    this.load.image('personBike60x79', 'images/person-bike-60x79.png');
    this.load.image('particlesGreen', 'images/particles-green.png');
    this.load.image('boxName', 'images/box-name.png');
    this.load.image('boxTime', 'images/box-time.png');
    this.load.image('logoGame156x66', 'images/logo-game-156x66.png');
    this.loadQuestionsHTML();
    this.loadLifeImages();
    if (this.isDay()) {
      this.load.image('backgroundGame', 'images/bg-scene-game-day.jpg');
    } else {
      this.load.image('backgroundGame', 'images/bg-scene-game-night.jpg');
    }
  },
  create: function () {
    this.add.image(400, 214, 'backgroundGame');
    this.add.image(135, 35, 'boxName');
    this.add.image(710, 35, 'boxTime');
    this.add.image(420, 40, 'logoGame156x66');
    this.sGameOver = this.sound.add("sGameOver", {
      loop: false,
      volume: 1
    });
    this.sGameSuccess = this.sound.add("sGameSuccess", {
      loop: false,
      volume: 1
    });
    this.sQuestionCorrect = this.sound.add("sQuestionCorrect", {
      loop: false,
      volume: 1
    });
    this.sQuestionIncorrect = this.sound.add("sQuestionIncorrect", {
      loop: false,
      volume: 1
    });
    this.sQuestionTime = this.sound.add("sQuestionTime", {
      loop: false,
      volume: 1
    });
    this.particlesGreen = this.add.particles('particlesGreen');
    this.personBike60x79 = this.add.image(34, 380, 'personBike60x79');
    this.boxLifes = this.add.image(744, 52, 'boxLifes3');
    this.add.text(80, 25, this.name, {
      fontFamily: "'Courier New', Courier, monospace",
      fontSize: 15,
      color: "#EDEEEA"
    });
    this.add.text(629, 412, '[F1] Ajuda - [P] Placar', {
      fontFamily: "'Courier New', Courier, monospace",
      fontSize: 12,
      color: "#EDEEEA"
    });
    this.countdownText = this.add.text(695, 20, this.formatTime(this.initialCountdownTime), {
      fontFamily: "'Courier New', Courier, monospace",
      fontSize: 25,
      color: "#EDEEEA"
    });
    this.timedEvent = this.time.addEvent({
      delay: 1000,
      callback: this.onEvent,
      callbackScope: this,
      loop: true
    });
    this.add.text(73, 46, 'trocar', {
      fontFamily: "'Courier New', Courier, monospace",
      fontSize: 11,
      color: "#EDEEEA"
    }).setInteractive().on('pointerover', function () {
      this.setStyle({
        fill: '#EE642E'
      });
    }).on('pointerout', function () {
      this.setStyle({
        fill: '#EDEEEA'
      });
    }).on('pointerdown', function () {
      this.scene.restart();
      this.scene.start('user');
    }, this);
    this.questionsJson = this.cache.json.get('questionsJson').sort(() => Math.random() - 0.5);
    this.questionsJson.forEach(question => {
      this.questionsIds.push(question.id);
    });
    this.currentQuestion = this.questionsIds[0];
    this.showQuestion();
    this.eventKeys();
  },
  showQuestion: function (questionID) {
    var questionID = questionID || this.currentQuestion;
    this.questionHTML = this.add.dom(400, 208).setInteractive().createFromCache(`question${questionID}`);
    document.querySelector("#questionPosition").innerHTML = `Questão ${this.getQuestionIndexByID(this.questionsJson, questionID) + 1} de ${this.questionsJson.length}`;
    document.querySelector("#questionCorrect").innerHTML = `Acertos: ${this.questionsCorrects}`;
  },
  checkQuestion: function (questionID, answerID, keyNumber) {
    if (this.checkAnswerKeyExists(questionID, answerID, keyNumber) && !this.gameEnd) {
      this.questionHTML.destroy();
      if (!this.checkCorrectQuestion(questionID, answerID)) {
        this.sQuestionIncorrect.play();
        if (this.lifes === 0) {
          return this.gameOver('[Acabaram suas vidas]');
        } else {
          this.updateLifes();
        }
      }
      if (this.questionsJson.length === this.getQuestionIndexByID(this.questionsJson, questionID) + 1) {
        this.gameFinish();
      } else {
        var nextQuestion = this.getNextQuestionID(this.questionsJson, questionID);
        this.currentQuestion = nextQuestion;
        this.showQuestion(nextQuestion);
      }
    }
  },
  checkAnswerKeyExists: function (questionID, answerID, keyNumber) {
    var totalAnswers = this.getQuestionByID(this.questionsJson, questionID).answers;
    totalAnswers = Object.values(totalAnswers).filter(Boolean).length;
    return keyNumber <= totalAnswers;
  },
  checkCorrectQuestion: function (questionID, answerID) {
    var question = this.getQuestionByID(this.questionsJson, questionID);
    var correct = false;
    switch (answerID) {
      case 'answer_a':
        correct = question.correct_answers.answer_a_correct === "true";
        break;
      case 'answer_b':
        correct = question.correct_answers.answer_b_correct === "true";
        break;
      case 'answer_c':
        correct = question.correct_answers.answer_c_correct === "true";
        break;
      case 'answer_d':
        correct = question.correct_answers.answer_d_correct === "true";
        break;
    }
    if (correct) {
      this.sQuestionCorrect.play();
      this.questionsCorrects += 1;
      this.initialCountdownTime += 10;
      var emitter = this.particlesGreen.createEmitter({
        tint: 0x00ff00,
        alpha: { start: 1, end: 0 },
        scale: { start: 0.5, end: 1.5 },
        speed: { random: [20, 100] },
        accelerationY: { random: [-100, 200] },
        rotate: { min: -180, max: 180 },
        lifespan: { min: 300, max: 800 },
        frequency: 20,
        maxParticles: 4
      });
      emitter.startFollow(this.countdownText);
      setTimeout(() => emitter.stop(), 500);
    }
    this.tweenProg(correct);
    return correct;
  },
  updateLifes: function () {
    this.lifes -= 1;
    this.boxLifes.destroy();
    this.boxLifes = this.add.image(744, 52, `boxLifes${this.lifes}`);
  },
  loadQuestionsHTML: function () {
    var questionsIds = [792, 983, 419, 651, 593, 606, 901, 243, 850, 845, 1066, 829, 842, 1058, 471, 689, 453, 629, 801, 295];
    questionsIds.forEach(id => {
      this.load.html(`question${id}`, `html/scenes/game/questions/${id}.html`).start();
    });
  },
  loadLifeImages: function () {
    for (var i = 0; i <= 3; i++) {
      this.load.image(`boxLifes${i}`, `images/box-stars-${i}.png`);
    }
  },
  isDay: function () {
    const hours = new Date().getHours();
    return hours >= 6 && hours < 18;
  },
  gameOver: function (text) {
    this.input.keyboard.enabled = false;
    this.gameEnd = true;
    this.sQuestionTime.stop();
    this.sGameOver.play();
    this.timedEvent.remove(false);
    this.add.dom(400, 208).setInteractive().createFromCache('gameOver');
    document.querySelector("#gameOverMessage").innerHTML = text || '';
    document.querySelector("#gameOverScore").innerHTML = `Acertou ${this.questionsCorrects} de ${this.questionsJson.length} questões!`;
    document.querySelector("#playAgain").addEventListener('click', () => {
      this.scene.restart();
    });
  },
  gameFinish: function () {
    this.gameEnd = true;
    this.gameFinished = true;
    this.sQuestionTime.stop();
    this.sGameSuccess.play();
    this.timedEvent.remove(false);
    this.setScore();
    this.add.dom(400, 208).setInteractive().createFromCache('gameFinished');
    document.querySelector("#gameFinishedScore").innerHTML = `Acertou ${this.questionsCorrects} de ${this.questionsJson.length} questões<br> Pontuação: <strong>${this.userScore}</strong> [P]`;
    document.querySelector("#playAgain").addEventListener('click', () => {
      this.playAgain();
    });
    this.personBike60x79.destroy();
    this.personBike60x79 = this.physics.add.image(760, 380, 'personBike60x79');
    this.personBike60x79.setVelocity(200, 200);
    this.personBike60x79.setBounce(1, 1);
    this.personBike60x79.setCollideWorldBounds(true);
    var emitter = this.particlesGreen.createEmitter({
      speed: 100,
      scale: {
        start: 0.5,
        end: 0
      },
      blendMode: 'ADD'
    });
    emitter.startFollow(this.personBike60x79);
  },
  playAgain: function () {
    if (this.gameEnd) {
      this.gameEnd = false;
      this.gameFinished = false;
      this.userScore = false;
      this.scene.restart();
    }
  }, 
  onEvent: function () {
    if (this.initialCountdownTime === 0) {
      this.timedEvent.remove(false);
      this.questionHTML.destroy();
      this.gameOver('[Seu tempo esgotou]');
    } else {
      if (this.initialCountdownTime === 10) {
        this.sQuestionTime.play();
      }
      if (this.initialCountdownTime > 10) {
        this.sQuestionTime.stop();
      }
      this.initialCountdownTime -= 1;
      this.countdownText.setText(this.formatTime(this.initialCountdownTime));
    }
  },
  tweenProg: function (correct) {
    this.input.keyboard.enabled = false;
    if (correct) {
      var emitter = this.particlesGreen.createEmitter({
        speed: 100,
        scale: {
          start: 0.5,
          end: 0
        },
        blendMode: 'ADD'
      });
      emitter.startFollow(this.personBike60x79);
    }
    const tween = this.add.tween({
      targets: this.personBike60x79,
      x: this.personBike60x79.x + 36.5,
      duration: 1000,
      yoyo: false,
      ease: 'Linear',
      repeat: 0,
      onComplete: () => {
        this.input.keyboard.enabled = true;
        emitter && emitter.stop();
      }
    });
  },
  showHelp: function () {
    if (!this.helpBox) {
      this.helpBox = this.add.dom(400, 208).setInteractive().createFromCache('gameHelp');
      document.querySelector("#closeHelp").addEventListener('click', () => {
        this.showHelp();
      });
    } else {
      this.helpBox.destroy();
      this.helpBox = false;
    }
  },
  showScore: function () {
    if (!this.scoreBox) {
      var scoreLocal = JSON.parse(localStorage.getItem("score") || "[]").sort((a, b) => {
        return b.score - a.score;
      }).slice(0, 6);
      this.scoreBox = this.add.dom(400, 208).setInteractive().createFromCache('gameScore');
      document.querySelector("#boxScore ol").innerHTML = new Array(6)
        .fill('<li>[vazio]</li>')
        .map((item, index) => {
          if (scoreLocal[index]) {
            var currentUser = this.name === scoreLocal[index].name ? ' <small>(você)</small>' : '';
            return `<li>${scoreLocal[index].score} - ${scoreLocal[index].name}${currentUser}</li>`;
          }
          return item;
        })
        .join('');
      document.querySelector("#closeScore").addEventListener('click', () => {
        this.showScore();
      });
    } else {
      this.scoreBox.destroy();
      this.scoreBox = false;
    }
  },
  setScore: function () {
    var scoreLocal = JSON.parse(localStorage.getItem("score") || "[]");
    this.userScore = Math.round(((this.questionsCorrects * 100) + (this.initialCountdownTime * 5)) * 1000000 / 3800);
    scoreLocal.push({
      name: this.name,
      score: this.userScore
    });
    localStorage.setItem("score", JSON.stringify(scoreLocal));
  },
  showInfo: function () {
    if (!this.infoBox) {
      this.infoBox = this.add.dom(400, 208).setInteractive().createFromCache('gameInfo');
      document.querySelector("#closeInfo").addEventListener('click', () => {
        this.showInfo();
      });
    } else {
      this.infoBox.destroy();
      this.infoBox = false;
    }
  },
  showCredits: function () {
    if (this.gameFinished) {
      if (!this.ee1) {
        this.sound.pauseAll();
        this.ee1 = this.add.dom(400, 204).setInteractive().createFromCache('gameEe1');
        document.querySelector("#closeEe1").addEventListener('click', () => {
          this.showCredits();
        });
      } else {
        this.ee1.destroy();
        this.ee1 = false;
        this.sound.resumeAll();
      }
    }
  },
  formatTime(seconds) {
    var minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
    var partInSeconds = seconds % 60;
    partInSeconds = partInSeconds.toString().padStart(2, '0');
    return `${minutes}:${partInSeconds}`;
  },
  getQuestionByID: function (myArray, value) {
    return myArray.find(item => item.id === value);
  },
  getQuestionIndexByID: function (myArray, value) {
    return myArray.findIndex(item => item.id === value);
  },
  getNextQuestionID: function (myArray, value) {
    var currentIndex = this.getQuestionIndexByID(myArray, value);
    return this.questionsJson[currentIndex + 1].id;
  },
  eventKeys: function () {
    this.input.keyboard.on('keydown', function (event) {
      event.preventDefault();
      var code = event.keyCode;
      if (document.querySelector('#boxQuestion')) {
        if (code === 49 || code === 97) {
          this.checkQuestion(this.currentQuestion, 'answer_a', 1);
        }
        if (code === 50 || code === 98) {
          this.checkQuestion(this.currentQuestion, 'answer_b', 2);
        }
        if (code === 51 || code === 99) {
          this.checkQuestion(this.currentQuestion, 'answer_c', 3);
        }
        if (code === 52 || code === 100) {
          this.checkQuestion(this.currentQuestion, 'answer_d', 4);
        }
      }
      if (code === 112) {
        this.showHelp();
      }
      if (code === 80) {
        this.showScore();
      }
      if (code === 73) {
        this.showInfo();
      }
      if (code === 67) {
        this.showCredits();
      }
      if (code === 74) {
        this.playAgain();
      }
    }, this);
  }
});
var config = {
  type: Phaser.WEBGL,
  parent: 'game',
  width: 800,
  height: 429,
  backgroundColor: '#292737',
  autoCenter: true,
  dom: {
    createContainer: true
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: {
        y: 50
      }
    }
  },
  scene: [User, Info, Game]
};
var game = new Phaser.Game(config);