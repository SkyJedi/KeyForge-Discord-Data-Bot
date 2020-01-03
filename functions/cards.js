const main = require('../index')
const { fetchCard } = require('./fetch')
const { buildAttachment } = require('./buildAttachment')
const { sets } = require('../card_data')
const { get } = require('lodash')

const cards = async (msg, params, flags) => {
  params = params.slice(0, 5)
  let text, attachment
  //fetch cards data
  const cards = params.map(card => fetchCard(card, flags)).filter(Boolean)
  if(0 < cards.length) {
    const name = cards.map(card => `${card.card_number}`).join('_') + '.png'
    attachment = await buildAttachment(cards, name, flags)
    text = cards.map(
      card => `**${card.card_title} • #${card.card_number} • ${get(sets.filter(set => card.expansion === set.set_number), '[0].flag', 'ERROR')}**`).
      join('\n')
  } else return

  main.sendMessage(msg, text, attachment)
}

exports.cards = cards;