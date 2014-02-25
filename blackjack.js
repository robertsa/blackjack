// The deck of 52 playing cards.
var deck = [];

// The dealer's hand of cards.
var dealerHand = [];

// The dealer's score.
var dealerScore = 0;

// The count of the dealer's wins.
var dealerWins = 0;

// The player's hand of cards.
var playerHand = [];

// The player's score.
var playerScore = 0;

// The amount of money the player has.
var playerMoney = 100;

// The amount the player has bet.
var playerBet = 0;

// The count of the player's wins.
var playerWins = 0;

// The outcome of the round.
var outcome;

// The number of hands that have been dealt.
var handCount = 0;

// Constructor function for the playing cards.
function Card(value, suit, points) {
  this.value = value;
  this.suit = suit;
  this.points = points;
}

// Populate the deck with all 52 cards.
function populateDeck() {
  // Clubs.
  deck.push(new Card("A", "clubs", 11));
  deck.push(new Card("J", "clubs", 10));
  deck.push(new Card("Q", "clubs", 10));
  deck.push(new Card("K", "clubs", 10));
  for (var i = 2; i < 11; i++) {
    deck.push(new Card(i, "clubs", i));
  }
  // Diamonds.
  deck.push(new Card("A", "diams", 11));
  deck.push(new Card("J", "diams", 10));
  deck.push(new Card("Q", "diams", 10));
  deck.push(new Card("K", "diams", 10));
  for (var i = 2; i < 11; i++) {
    deck.push(new Card(i, "diams", i));
  }
  // Hearts.
  deck.push(new Card("A", "hearts", 11));
  deck.push(new Card("J", "hearts", 10));
  deck.push(new Card("Q", "hearts", 10));
  deck.push(new Card("K", "hearts", 10));
  for (var i = 2; i < 11; i++) {
    deck.push(new Card(i, "hearts", i));
  }
  // Spades.
  deck.push(new Card("A", "spades", 11));
  deck.push(new Card("J", "spades", 10));
  deck.push(new Card("Q", "spades", 10));
  deck.push(new Card("K", "spades", 10));
  for (var i = 2; i < 11; i++) {
    deck.push(new Card(i, "spades", i));
  }
}

// Randomly reorganize the cards in the deck, working backwards from the top.
function shuffleDeck() {
  for (var i = deck.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = deck[i];
    deck[i] = deck[j];
    deck[j] = temp;
  }
}

// Determine the suit of the given card.
// Return the unicode version of the card's suit.
function determineSuit(card) {
  switch (card.suit) {
    case "clubs":
      return "\u2663";
    case "hearts":
      return "\u2665";
    case "diams":
      return "\u2666";
    case "spades":
      return "\u2660";
  }
}

// Deal from the top of the deck to the given hand.
// Create and append a card to the display for the given hand.
function dealCard(hand) {
  var card = deck.pop();
  hand.push(card);
  var cardElement = document.createElement("div");
  cardElement.classList.add("card");
  cardElement.classList.add(card.suit);
  var cardElementText = document.createElement("span");
  cardElementText.appendChild(document.createTextNode(card.value + " "));
  var suit = determineSuit(card);
  cardElementText.appendChild(document.createTextNode(suit));
  cardElement.appendChild(cardElementText);
  if (hand === playerHand) {
    playerScore += card.points;
    document.getElementById("playerHand").appendChild(cardElement);
  } else {
    dealerScore += card.points;
    document.getElementById("dealerHand").appendChild(cardElement);
  }
  // Determine if the player has busted.
  if (playerScore > 21) {
    if (!isBlackjack(playerHand)) {
      // If the player's hand is not blackjack.
      document.getElementById("standButton").disabled = true;
      document.getElementById("hitButton").disabled = true;
      outcome = "You have busted. You lose this round.";
      dealerWins += 1;
      showOutcome();
      updateWinsDisplay();
    }
  }
}

// Deal the initial cards for a round.
// The dealer's first card will be shown face down.
function dealInitialHands() {
  setTimeout(function() {
    dealCard(playerHand);
  }, 600);
  setTimeout(function() {
    var card = deck.pop();
    dealerHand.push(card);
    dealerScore += card.points;
    var back = document.createElement("img");
    back.setAttribute("src", "images/back.png");
    back.setAttribute("id", "holeCard");
    document.getElementById("dealerHand").appendChild(back);
  }, 1200);
  setTimeout(function() {
    dealCard(playerHand);
  }, 1800);
  setTimeout(function() {
    dealCard(dealerHand);
    handCount++;
    document.getElementById("hitButton").disabled = false;
    document.getElementById("standButton").disabled = false;
  }, 2400);
}

// Flip the hole card and deal cards to the dealer until he has 17 or more points.
function resolveDealerHand() {
  var dh = document.getElementById("dealerHand");
  var card = document.createElement("div");
  card.classList.add("card");
  card.classList.add(dealerHand[0].suit);
  var cardText = document.createElement("span");
  cardText.appendChild(document.createTextNode(dealerHand[0].value + " "));
  var suit = determineSuit(dealerHand[0]);
  cardText.appendChild(document.createTextNode(suit));
  card.appendChild(cardText);
  dh.replaceChild(card, dh.children[0]);
  while (dealerScore < 17) {
    dealCard(dealerHand);
    // If the dealer has busted, the player wins.
    if (dealerScore > 21) {
      if (!isBlackjack(dealerHand)) {
        // If the dealer's hand is not blackjack.
        outcome = "The dealer has busted. You win this round.";
        playerWins += 1;
        increasePlayerMoney(playerBet * 2);
        showOutcome();
        updateWinsDisplay();
        return;
      }
    }
  }
  // If the dealer did not bust, compare the hands.
  compareHands();
}

// Return true if the given hand is blackjack.
function isBlackjack(hand) {
  if (hand[0].value == "A" && hand[1].value == "A" ||
      hand[0].value == "A" && hand[1].points == 10 ||
      hand[0].points == 10 && hand[1].value == "A") {
    return true;
  } else {
    return false;
  }
}

// Determine if the round is a push or if there is a winner.
function compareHands() {
  if (isBlackjack(playerHand) && isBlackjack(dealerHand)) {
    // Both the dealer and the player have blackjack. The round is a push.
    outcome = "Both you and the dealer have blackjack. The round is a push.";
    increasePlayerMoney(playerBet);
  } else if (isBlackjack(dealerHand)) {
    // The dealer has blackjack. The dealer wins.
    outcome = "The dealer has blackjack. You lose this round.";
    dealerWins +=1 ;
    updateWinsDisplay();
  } else if (isBlackjack(playerHand)) {
    // The player has blackjack. The player wins.
    outcome = "You have blackjack. You win this round.";
    playerWins += 1;
    increasePlayerMoney(playerBet * 2);
    updateWinsDisplay();
  } else if (playerScore == dealerScore) {
    // The hands are tied. The round is a push.
    outcome = "The hands are tied. This round is a push.";
    increasePlayerMoney(playerBet);
  } else if (dealerScore > playerScore) {
    // The dealer has the better hand. The dealer wins.
    outcome = "The dealer has the better hand. You lose this round.";
    dealerWins += 1;
    updateWinsDisplay();
  } else {
    // The player has the better hand. The player wins.
    outcome = "You have the better hand. You win this round.";
    playerWins += 1;
    increasePlayerMoney(playerBet * 2);
    updateWinsDisplay();
  }
  showOutcome();
}

// Make visible the outcome panel and show the outcome for the current round.
function showOutcome() {
  var outcomePanel = document.getElementById("outcomePanel");
  document.getElementById("mainContainer").style.opacity = 0.7;
  outcomePanel.style.visibility = "visible";
  outcomePanel.children[0].innerHTML = outcome;
}

// Make visible the bet panel and prompt the player for a bet.
function promptForBet() {
  var betPanel = document.getElementById("betPanel");
  document.getElementById("mainContainer").style.opacity = 0.7;
  betPanel.style.visibility = "visible";
  if (playerMoney > playerBet) {
    // Retain the bet from the last round.
    document.getElementById("betDisplay").children[0].innerHTML = playerBet;
  } else {
    // Default the bet to the amount of the player's money.
    document.getElementById("betDisplay").children[0].innerHTML = playerMoney;
    playerBet = playerMoney;
  }
}

// Update the displayed win counts.
function updateWinsDisplay() {
  document.getElementById("playerWinsDisplay").innerHTML = playerWins;
  document.getElementById("dealerWinsDisplay").innerHTML = dealerWins;
}

// Increase the amount of the player's money and update the player money display.
function increasePlayerMoney(amt) {
  playerMoney += amt;
  document.getElementById("playerMoneyDisplay").innerHTML = "$" + playerMoney;
}

// Decrease the amount of the player's money and update the player money display.
function decreasePlayerMoney(amt) {
  playerMoney -= amt;
  document.getElementById("playerMoneyDisplay").innerHTML = "$" + playerMoney;
}


// Increase the player's bet and update the player bet display.
function increaseBet() {
  if (playerMoney != 0 && playerMoney != playerBet) {
    playerBet += 10;
    document.getElementById("betDisplay").children[0].innerHTML = playerBet;
  }
}

// Decrease the player's bet and update the player bet display.
function decreaseBet() {
  if (playerBet >= 10 && playerMoney != 0) {
    playerBet -= 10;
    document.getElementById("betDisplay").children[0].innerHTML = playerBet;
  }
}

// Bet from the player's money the given amt and update the player money display.
function bet(amt) {
  if (playerMoney - amt >= 0) {
    playerMoney -= amt;
    document.getElementById("playerMoneyDisplay").innerHTML = "$" + playerMoney;
  }
}

// Make visible the greeting panel.
function showGreetingPanel() {
  document.getElementById("mainContainer").style.opacity = 0.7;
  document.getElementById("greetingPanel").style.visibility = "visible";
}

// Make visible the reset panel.
function showResetPanel() {
  document.getElementById("mainContainer").style.opacity = 0.7;
  document.getElementById("resetPanel").style.visibility = "visible";
}

// Clear the table to start a new round.
function startNewRound() {
  var ph = document.getElementById("playerHand");
  var dh = document.getElementById("dealerHand");
  // Remove the player's cards.
  for (var i = ph.children.length - 1; i > -1; i--) {
    ph.removeChild(ph.children[i]);
  }
  // Remove the dealer's cards.
  for (var i = dh.children.length - 1; i > -1; i--) {
    dh.removeChild(dh.children[i]);
  }
  playerScore = 0;
  dealerScore = 0;
  outcome = "";
  playerHand.splice(0);
  dealerHand.splice(0);
  // Since this is a single-deck game for one player, if five hands have been
  // played, put all of the cards back into the deck and reshuffle.
  if (handCount == 5) {
    deck.splice(0);
    populateDeck();
    shuffleDeck();
    handCount = 0;
  }
}

populateDeck();
shuffleDeck();
updateWinsDisplay();
showGreetingPanel();

// Initial update to the player money display.
document.getElementById("playerMoneyDisplay").innerHTML = "$" + playerMoney;

// Rules link.
document.getElementById("rulesLink").addEventListener("click", function() {
  document.getElementById("rulesPanel").style.visibility = "visible";
}, false);

// Rules panel close button.
document.getElementById("closeRulesPanelButton").addEventListener("click", function() {
  document.getElementById("rulesPanel").style.visibility = "hidden";
}, false);

// Bet button.
document.getElementById("betButton").addEventListener("click", function() {
  bet(playerBet);
  document.getElementById("betPanel").style.visibility = "hidden";
  document.getElementById("mainContainer").style.opacity = 1;
  dealInitialHands();
}, false);

// Increase bet image.
document.getElementById("betImgContainer").children[0].addEventListener("click", function() {
  increaseBet();
}, false);

// Decrease bet image.
document.getElementById("betImgContainer").children[1].addEventListener("click", function() {
  decreaseBet();
}, false);

// Play button.
document.getElementById("playButton").addEventListener("click", function() {
  document.getElementById("greetingPanel").style.visibility = "hidden";
  document.getElementById("mainContainer").style.opacity = 1;
  promptForBet();
}, false);

// Hit button.
document.getElementById("hitButton").addEventListener("click", function() {
  dealCard(playerHand);
}, false);

// Stand button.
document.getElementById("standButton").addEventListener("click", function() {
  document.getElementById("standButton").disabled = true;
  document.getElementById("hitButton").disabled = true;
  // The player is satisfied with his or her hand, so resolve the dealer's hand.
  resolveDealerHand();
}, false);

// Next round button.
document.getElementById("nextRoundButton").addEventListener("click", function() {
  document.getElementById("outcomePanel").style.visibility = "hidden";
  // If the player has run out of money, display the reset panel.
  if (playerMoney == 0) {
    showResetPanel();
  } else {
    startNewRound();
    document.getElementById("betPanel").style.opacity = 1;
    promptForBet();
  }
}, false);

// Reset button. Start a new round after resetting all values to their defaults.
document.getElementById("resetGameButton").addEventListener("click", function() {
  handCount = 0;
  deck.splice(0);
  populateDeck();
  shuffleDeck();
  playerWins = 0;
  dealerWins = 0;
  playerMoney = 100;
  playerBet = 0;
  document.getElementById("resetPanel").style.visibility = "hidden";
  document.getElementById("mainContainer").style.opacity = 1;
  document.getElementById("betPanel").style.opacity = 1;
  document.getElementById("playerMoneyDisplay").innerHTML = "$" + playerMoney;
  updateWinsDisplay();
  startNewRound();
  promptForBet();
}, false);