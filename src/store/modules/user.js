import Vue from 'vue'
import { ACCESS_TOKEN, USER } from '@/store/mutation-types'
import adminApi from '@/api/admin'
import userApi from '@/api/user'

const user = {
  state: {
    token: null,
    name: '',
    avatar: '',
    roles: [],
    info: {},
    user: {}
  },
  mutations: {
    SET_TOKEN: (state, token) => {
      Vue.ls.set(ACCESS_TOKEN, token)
      state.token = token
    },
    SET_NAME: (state, { name }) => {
      state.name = name
    },
    SET_AVATAR: (state, avatar) => {
      state.avatar = avatar
    },
    SET_ROLES: (state, roles) => {
      state.roles = roles
    },
    SET_INFO: (state, info) => {
      state.info = info
    },
    CLEAR_TOKEN: state => {
      Vue.ls.remove(ACCESS_TOKEN)
      state.token = null
    },
    SET_USER: (state, user) => {
      Vue.ls.set(USER, user)
      state.user = user
    }
  },
  actions: {
    loadUser({ commit }) {
      return Promise((resolve, reject) => {
        userApi
          .getProfile()
          .then(response => {
            commit('SET_USER', response.data.data)
            resolve(response)
          })
          .catch(error => {
            reject(error)
          })
      })
    },
    login({ commit }, { username, password }) {
      return new Promise((resolve, reject) => {
        adminApi
          .login(username, password)
          .then(response => {
            const token = response.data.data
            Vue.$log.debug('Got token', token)
            commit('SET_TOKEN', token)

            resolve(response)
          })
          .catch(error => {
            reject(error)
          })
      })
    },
    logout({ commit }) {
      return new Promise(resolve => {
        commit('CLEAR_TOKEN')
        adminApi
          .logout()
          .then(response => {
            resolve()
          })
          .catch(() => {
            resolve()
          })
      })
    },
    refreshToken({ commit }, refreshToken) {
      return new Promise((resolve, reject) => {
        adminApi
          .refreshToken(refreshToken)
          .then(response => {
            const token = response.data.data
            Vue.$log.debug('Got token', token)
            commit('SET_TOKEN', token)

            resolve(response)
          })
          .catch(error => {
            const data = error.response.data
            Vue.$log.debug('Refresh error data', data)
            if (data && data.status === 400 && data.data === refreshToken) {
              // The refresh token expired
              commit('CLEAR_TOKEN')
            }
            reject(error)
          })
      })
    }
  }
}

export default user
