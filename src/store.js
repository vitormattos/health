/*
 * @copyright Copyright (c) 2018 ...
 *
 * @author ...
 *
 * @license GNU AGPL version 3 or any later version
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 */

import Vue from 'vue'
import Vuex from 'vuex'
import moment from '@nextcloud/moment'
import axios from '@nextcloud/axios'
import { generateUrl } from '@nextcloud/router'

Vue.use(Vuex)

export default new Vuex.Store({
	state: {
		activePersonId: null,
		activeModule: 'weight', // persons
		showSidebar: false,
		persons: null,
	},
	getters: {
		activePersonId: state => state.activePersonId,
		persons: state => (state.persons) ? state.persons : null,
		person: state => (state.persons && state.persons[state.activePersonId]) ? state.persons[state.activePersonId] : null,
		personName: state => (state.persons && state.persons[state.activePersonId]) ? state.persons[state.activePersonId].name : '',
		personAge: state => (state.persons && state.persons[state.activePersonId]) ? state.persons[state.activePersonId].age : null,
		personSize: state => (state.persons && state.persons[state.activePersonId]) ? state.persons[state.activePersonId].size : null,
		personSex: state => (state.persons && state.persons[state.activePersonId]) ? state.persons[state.activePersonId].sex : '',
		personsLength: state => state.persons ? state.persons.length : 0,
		personModuleWeight: state => (state.persons && state.persons[state.activePersonId]) ? state.persons[state.activePersonId].enabledModuleWeight : false,
		lastWeight: state => {
			if (state.persons && state.persons[state.activePersonId] && state.persons[state.activePersonId].weightdata[0]) {
				return state.persons[state.activePersonId].weightdata[0].weight
			}
			return null
		},
		weightTarget: state => (state.persons && state.persons[state.activePersonId]) ? state.persons[state.activePersonId].weightTarget : null,
		weightUnit: state => (state.persons && state.persons[state.activePersonId]) ? state.persons[state.activePersonId].weightUnit : null,
		weightTargetInitialWeight: state => (state.persons && state.persons[state.activePersonId]) ? state.persons[state.activePersonId].weightTargetInitialWeight : null,
		weightTargetBounty: state => (state.persons && state.persons[state.activePersonId]) ? state.persons[state.activePersonId].weightTargetBounty : null,
		weightMeasurementName: state => (state.persons && state.persons[state.activePersonId]) ? state.persons[state.activePersonId].weightMeasurementName : null,
	},
	mutations: {
		persons(state, persons) {
			state.persons = persons
		},
		addPerson(state, person) {
			const p = state.persons
			p.push(person)
			state.persons = p
		},
		activePersonId(state, id) {
			state.activePersonId = id
		},
		activeModule(state, module) {
			state.activeModule = module
		},
		showSidebar(state, bool) {
			state.showSidebar = bool
		},
		deletePerson(state, id) {
			const p = state.persons
			p.splice(id, 1)
			state.persons = p
		},
		updatePersonName(state, o) {
			state.persons[o.id].name = o.name
		},
		updatePersonAge(state, age) {
			state.persons[state.activePersonId].age = parseInt(age, 0)
		},
		updatePersonSex(state, sex) {
			state.persons[state.activePersonId].sex = sex
		},
		updatePersonSize(state, size) {
			state.persons[state.activePersonId].size = parseInt(size, 0)
		},
		updatePersonEnabledModuleWeight(state, value) {
			state.persons[state.activePersonId].enabledModuleWeight = value
		},
		updatePersonWeightUnit(state, value) {
			state.persons[state.activePersonId].weightUnit = value
		},
		updatePersonWeightTarget(state, value) {
			state.persons[state.activePersonId].weightTarget = parseInt(value)
		},
		updatePersonWeightTargetBounty(state, value) {
			state.persons[state.activePersonId].weightTargetBounty = value
		},
		updatePersonWeightTargetInitialWeight(state, value) {
			state.persons[state.activePersonId].weightTargetInitialWeight = parseInt(value)
		},
		updatePersonWeightMeasurementName(state, value) {
			state.persons[state.activePersonId].weightMeasurementName = value
		},
		setWeightData(state, value) {
			state.persons[state.activePersonId].weightdata = value
		},
	},
	actions: {
		addPerson: function({ context, getters, commit }, name) {
			axios.post(generateUrl('/apps/health/persons'), { name: name })
				.then(
					(response) => {
						// console.debug('debug axPostPersons SUCCESS-------------')
						// console.debug(response)
						const p = response.data
						commit('addPerson', p)
						const id = getters.personsLength - 1
						commit('activePersonId', id)
					},
					(err) => {
						console.debug('debug axPostPersons ERROR-------------')
						console.debug(err)
					}
				)
				.catch((err) => {
					console.debug('error detected')
					console.debug(err)
				})
		},
		deletePerson: function({ context, getters, commit }, id) {
			const p = getters.persons[id]
			axios.delete(generateUrl('/apps/health/persons/' + p.id))
				.then(
					(response) => {
						// console.debug('debug axDeletePersons SUCCESS-------------')
						// console.debug(response)
						commit('deletePerson', id)
						if (getters.activePersonId === id) {
							commit('activePersonId', 0)
						}
					},
					(err) => {
						console.debug('debug axDeletePersons ERROR-------------')
						console.debug(err)
					}
				)
				.catch((err) => {
					console.debug('error detected')
					console.debug(err)
				})
		},
		updatePerson: function({ context, getters, commit }, data) {
			if (!('id' in data)) {
				data.id = getters.activePersonId
			}
			const p = getters.persons[data.id]
			axios.put(generateUrl('/apps/health/persons/' + p.id), { key: data.key, value: '' + data.value })
				.then(
					(response) => {
						// console.debug('debug axUpdatePersons SUCCESS-------------')
						// console.debug(response)
						const method = 'updatePerson' + data.key[0].toUpperCase() + data.key.slice(1)
						commit(method, data.value)
					},
					(err) => {
						console.debug('debug axUpdatePersons ERROR-------------')
						console.debug(err)
					}
				)
				.catch((err) => {
					console.debug('error detected')
					console.debug(err)
				})
		},
		addWeightData: function({ context, getters, commit }, data) {
			const d = getters.person.weightdata
			d.unshift(data)
			commit('setWeightData', d)
		},
		sortWeightData: function({ context, getters, commit }) {
			const d = getters.person.weightdata
			d.sort(function(a, b) {
				if (moment(a.date) > moment(b.date)) {
					return -1
				} else if (moment(a.date) < moment(b.date)) {
					return 1
				} else {
					return 0
				}
			})
			commit('setWeightData', d)
		},
		deleteWeightDataRow: function({ context, getters, commit }, i) {
			const d = getters.person.weightdata
			d.splice(i, 1)
			commit('setWeightData', d)
		},
	},
})