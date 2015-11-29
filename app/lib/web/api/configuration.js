'use strict'

module.exports = function (app) {
  let etcd = app.etcd

  return {
    createUser: function (req, res) {
      console.log(etcd)
      res.sendStatus(501)
    },

    readUser: function (req, res) {
      res.sendStatus(501)
    },

    updateUser: function (req, res) {
      res.sendStatus(501)
    },

    deleteUser: function (req, res) {
      res.sendStatus(501)
    },

    listUsers: function (req, res) {
      res.sendStatus(501)
    },

    createRole: function (req, res) {
      res.sendStatus(501)
    },

    readRole: function (req, res) {
      res.sendStatus(501)
    },

    updateRole: function (req, res) {
      res.sendStatus(501)
    },

    deleteRole: function (req, res) {
      res.sendStatus(501)
    },

    listRoles: function (req, res) {
      res.sendStatus(501)
    },

    createKey: function (req, res) {
      res.sendStatus(501)
    },

    readKey: function (req, res) {
      res.sendStatus(501)
    },

    updateKey: function (req, res) {
      res.sendStatus(501)
    },

    deleteKey: function (req, res) {
      res.sendStatus(501)
    },

    listKeys: function (req, res) {
      res.sendStatus(501)
    }
  }
}
