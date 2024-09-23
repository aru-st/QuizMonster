import React, { useState, useEffect } from "react";
import './App.css'; // CSSファイルを追加
import quizData from './quizData'; // quizData.jsから問題データをインポート

function App() {
  const [questions, setQuestions] = useState([]); // ランダムで選ばれた3題の問題を格納
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isQuizEnd, setIsQuizEnd] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(""); // 選択された答えを格納
  const [timeLeft, setTimeLeft] = useState(10); // 10秒のタイマー
  const [enemyHp, setEnemyHp] = useState(100000);  // 敵のHP
  const maxHp = 100000;  // 敵の最大HP
  const [isEnemyHit, setIsEnemyHit] = useState(false); // 敵がダメージを受けた時のアニメーション用
  const [isDamageBoosted, setIsDamageBoosted] = useState(false); // ダメージアップが有効かどうか
  const [isDamageBoostUsed, setIsDamageBoostUsed] = useState(false); // ダメージアップボタンが使用済みかどうか
  const [money, setMoney] = useState(0); // お金を管理する状態
  const [baseDamage, setBaseDamage] = useState(20); // 基本ダメージを管理する状態
  const [isShopOpen, setIsShopOpen] = useState(false); // ショップを開けるかどうかの状態
  const [isGameOver, setIsGameOver] = useState(false); // 敵を倒したかどうかの状態

  // クイズデータからランダムに10題選ぶ
  useEffect(() => {
    const randomQuestions = quizData.sort(() => 0.5 - Math.random()).slice(0, 10);
    setQuestions(randomQuestions);
  }, []);

  const currentQuestion = questions[currentQuestionIndex];

  useEffect(() => {
    if (timeLeft > 0 && !isGameOver) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer); // Cleanup timer on component unmount or reset
    } else if (timeLeft === 0 && !isGameOver) {
      handleNextQuestion(); // 時間切れになったら次の質問に進む
    }
  }, [timeLeft, isGameOver]);

  const handleAnswerSelect = (option) => {
    setSelectedAnswer(option); // 選択肢を選択するたびに選択が更新される
  };

  const handleNextQuestion = () => {
    let damage = isDamageBoosted ? baseDamage * 2 : baseDamage; // ダメージが増加している場合は2倍
    if (selectedAnswer === currentQuestion.answer) {
      if (damage >= enemyHp) {
        // ダメージが敵の残りHP以上の場合、敵を倒したとみなす
        setIsGameOver(true);
        setEnemyHp(0); // 敵のHPを0に設定
      } else {
        setScore(score + 1);
        setEnemyHp(enemyHp - damage);  // 正解したら敵のHPを減少
        setMoney(money + damage);      // 与えたダメージ分だけお金を増加
        setIsEnemyHit(true);           // 敵がダメージを受けた状態に変更

        // 震えアニメーションを0.5秒後に解除
        setTimeout(() => setIsEnemyHit(false), 500);
      }
    }

    const nextQuestionIndex = currentQuestionIndex + 1;
    if (nextQuestionIndex < questions.length && !isGameOver) {
      setCurrentQuestionIndex(nextQuestionIndex);
      setSelectedAnswer(""); // 次の質問用に選択をリセット
      setTimeLeft(10); // 次の質問に進むときにタイマーをリセット
    } else if (!isGameOver) {
      setIsQuizEnd(true);
      setIsShopOpen(true); // クイズ終了後にショップを開く
    }
  };

  // ダメージアップボタンをクリックしたときの処理
  const handleDamageBoost = () => {
    setIsDamageBoosted(true);     // ダメージを増加
    setIsDamageBoostUsed(true);   // ボタンを無効化
  };

  // ショップでダメージをアップグレードする処理
  const upgradeDamage = () => {
    const upgradeCost = 50; // ダメージアップに必要なコスト
    if (money >= upgradeCost) {
      setBaseDamage(baseDamage + 10);  // 基本ダメージを10増加
      setMoney(money - upgradeCost);   // お金を消費
    } else {
      alert("お金が足りません!"); // お金が足りない場合の警告
    }
  };

  const handleRestartQuiz = () => {
    setCurrentQuestionIndex(0); // 最初の質問に戻す
    setScore(0);                // スコアをリセット
    setSelectedAnswer("");       // 選択した回答をリセット
    setTimeLeft(10);             // タイマーをリセット
    setEnemyHp(maxHp);           // 敵のHPをリセット
    setIsDamageBoosted(false);   // ダメージブーストを解除
    setIsDamageBoostUsed(false); // ダメージブーストボタンを再び使えるように
    setIsQuizEnd(false);         // クイズ終了状態を解除
    setIsShopOpen(false);        // ショップを閉じる
    setIsGameOver(false);        // ゲーム終了状態をリセット
    const randomQuestions = quizData.sort(() => 0.5 - Math.random()).slice(0, 10); // 新しい問題をランダムで選ぶ
    setQuestions(randomQuestions);
  };

  return (
    <div className="quiz-app">
      {isGameOver ? (
        <div className="quiz-end fade-in">
          <h2>ここまで遊んでくれるとか神かよ</h2> {/* 敵を倒した時に表示 */}
          <p>正答数は {score}</p>
          <p>所持金: {money}</p> {/* クイズ終了時にmoneyを表示 */}
          <button className="restart-button" onClick={handleRestartQuiz}>もう一度遊ぶ</button> {/* もう一度遊ぶボタン */}
        </div>
      ) : isQuizEnd ? (
        <div className="quiz-end fade-in">
          <h2>終了！</h2>
          <p>正答数は {score} / {questions.length}問中</p>
          <p>所持金: {money}</p> {/* クイズ終了時にmoneyを表示 */}
          <button className="restart-button" onClick={handleRestartQuiz}>もう一度遊ぶ</button> {/* もう一度遊ぶボタン */}
        </div>
      ) : (
        <div className="quiz-battle">
          {/* 敵の画像表示 */}
          <div className={`enemy-container ${isEnemyHit ? 'shake' : ''}`}> {/* ダメージ時にshakeクラスを適用 */}
            <img src={require("./enemy-image.png")} alt="Enemy" className="enemy" />

            {/* 敵の体力表示を追加 */}
            <div className="enemy-hp-display">
              <p>HP: {enemyHp}/{maxHp}</p> {/* 敵の体力をバーの上に表示 */}
            </div>

            <div className="enemy-hp-bar">
              <div className="enemy-hp" style={{ width: `${(enemyHp / maxHp) * 100}%` }}></div>
            </div>
          </div>

          {/* 現在のmoneyを表示 */}
          <p className="money-display">お金: ${money}</p>

          {/* ダメージアップボタン */}
          <button
            className="damage-boost-button"
            onClick={handleDamageBoost}
            disabled={isDamageBoostUsed}  // 一度使ったら無効化
          >
            {isDamageBoostUsed ? "ブースト使用済み" : "ブーストを使う"}
          </button>

          <div className="quiz-question fade-in">
            <h2>{currentQuestion?.question}</h2>
            <div className="quiz-options">
              {currentQuestion?.options.map((option) => (
                <button
                  key={option}
                  onClick={() => handleAnswerSelect(option)}
                  className={`option-button ${selectedAnswer === option ? 'selected' : ''}`}
                >
                  {option}
                </button>
              ))}
            </div>
            <p>残り: {timeLeft} 秒</p>
            <button className="next-button" onClick={handleNextQuestion} disabled={!selectedAnswer}>
              {currentQuestionIndex < questions.length - 1 ? "次の問題" : "終わる"}
            </button>
          </div>
        </div>
      )}

      {isShopOpen && !isGameOver && (
        <div className="shop">
          <h2>ショップ</h2>
          <p>50マネーで攻撃力を強化できます</p>
          <button className="upgrade-button" onClick={upgradeDamage} disabled={money < 50}>
            攻撃力を強化する (コスト: 50)
          </button>
          <p>現在の攻撃力: {baseDamage}</p>
        </div>
      )}
    </div>
  );
}

export default App;
