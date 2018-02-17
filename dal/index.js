const mongodb = require('mongodb')
const MongoClient = mongodb.MongoClient

const config = require('../config').mongo
let teamsCollection

function getTeam (number) {
  return new Promise((resolve, reject) => {
    teamsCollection.findOne({number: number})
      .then(team => {
        if (!team) {
          const err = Error(`Team ${number} dosen't exist`)
          err.name = 'no-team-found'
          reject(err)
        } else {
          resolve(team)
        }
      })
      .catch(err => reject(err))
  })
}

function insertTeam (team) {
  teamsCollection.insertOne(team)
}

function updateTeam (team, number) {
  teamsCollection.updateOne({number: number}, team)
}

function removeTeam (number) {
  teamsCollection.removeOne({number: number})
}

function insertMatch (match, teamNumber) {
  return new Promise((resolve, reject) => {
    getTeam(teamNumber)
      .then(team => {
        const newMatch = match
        delete newMatch.number
        team.matches[match.number] = newMatch
        updateTeam(team, team.number)
        resolve()
      })
      .catch(err => reject(err))
  })
}

function matchExists (matchNumber, teamNumber) {
  return new Promise((resolve, reject) => {
    const query = {number: teamNumber}
    query[`matches.${matchNumber}`] = {$exists: true}
    teamsCollection.findOne(query)
      .then(item =>
        resolve(!!item)
      )
      .catch(err => reject(err))
  })
}

MongoClient.connect(config.url)
  .then(client => {
    client.db(config.dbName).collection(config.collectionName, function (err, coll) {
      if (err) throw err
      else {
        teamsCollection = coll
      }
    })
  })
  .catch(err => {
    console.error(err)
  })
module.exports = {
  matchExists,
  insertMatch,
  insertTeam,
  updateTeam,
  getTeam,
  removeTeam
}
