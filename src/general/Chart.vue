<!--
	- @copyright Copyright (c) 2020 Florian Steffens <flost-dev@mailbox.org>
	-
	- @author Florian Steffens
	-
	- @license GNU AGPL version 3 or any later version
	-
	- This program is free software: you can redistribute it and/or modify
	- it under the terms of the GNU Affero General Public License as
	- published by the Free Software Foundation, either version 3 of the
	- License, or (at your option) any later version.
	-
	- This program is distributed in the hope that it will be useful,
	- but WITHOUT ANY WARRANTY; without even the implied warranty of
	- MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
	- GNU Affero General Public License for more details.
	-
	- You should have received a copy of the GNU Affero General Public License
	- along with this program. If not, see <http://www.gnu.org/licenses/>.
	-
	-->

<template>
	<div>
		<div
			v-if="data && data.length > 0 && definition"
			class="chartDataRangeSelector">
			<select
				v-if="!isDetailRange"
				id="rangeDays"
				v-model="range"
				name="range">
				<option value="week">
					{{ t('health', 'last week') }}
				</option>
				<option value="month">
					{{ t('health', 'last month') }}
				</option>
				<option value="year">
					{{ t('health', 'last year') }}
				</option>
				<option value="all">
					{{ t('health', 'Show all') }}
				</option>
			</select>
			<select
				v-if="isDetailRange"
				id="rangeHours"
				v-model="range"
				name="range">
				<option value="1hour">
					{{ t('health', 'last hour') }}
				</option>
				<option value="4hours">
					{{ t('health', 'last 4 hours') }}
				</option>
				<option value="12hours">
					{{ t('health', 'last 12 hours') }}
				</option>
				<option value="24hours">
					{{ t('health', 'last 24 hours') }}
				</option>
				<option value="48hours">
					{{ t('health', 'last 48 hours') }}
				</option>
			</select>
		</div>
		<LineChart
			v-if="data && data.length > 0 && definition && chartType === 'line'"
			:chart-data="getChartData"
			:style="chartStyle"
			:options="options" />
		<EmptyContent
			v-if="!data || data.length === 0 || !definition"
			icon="icon-category-monitoring">
			No data for a chart
			<template #desc>
				{{ t('health', 'More than one dataset is required.') }}<br>
				<span v-if="data.length > 1">{{ t('health', 'You selected to show only data from the last {range}.', {range: range}) }}</span>
			</template>
		</EmptyContent>
	</div>
</template>

<script>
import LineChart from './charts/LineChart'
import EmptyContent from '@nextcloud/vue/dist/Components/EmptyContent'
import moment from '@nextcloud/moment'

export default {
	name: 'Chart',
	components: {
		LineChart,
		EmptyContent,
	},
	props: {
		chartType: {
			type: String,
			default: 'line', // only line charts for now!
		},
		data: {
			type: Array,
			default: null,
		},
		definition: {
			type: Array,
			default: null,
		},
		options: {
			type: Object,
			default: null,
		},
		rangeDefinition: {
			type: String,
			default: 'month',
		},
		chartStyle: {
			type: Object,
			default: null,
		},
	},
	data: function() {
		return {
			range: this.rangeDefinition,
		}
	},
	computed: {
		getChartData: function() {
			if (!this.definition || !this.data) {
				return null
			}

			const data = {}
			this.data.forEach(d => {
				this.definition.forEach(def => {
					if (!data[def.columnId]) {
						data[def.columnId] = []
					}
					if (def.valueId !== 'calculate' && d[def.timeId] && d[def.valueId] && this.isInTimeRange(d[def.timeId]) && def.show) {
						data[def.columnId].push({
							t: moment(d[def.timeId]),
							y: def.getValueY(d[def.valueId]),
						})
					} else if (def.valueId === 'calculate' && d[def.timeId] && this.isInTimeRange(d[def.timeId]) && def.show) {
						data[def.columnId].push({
							t: moment(d[def.timeId]),
							y: def.getValueY(d),
						})
					} else if (def.valueId === 'static' && d[def.timeId] && this.isInTimeRange(d[def.timeId]) && def.show) {
						data[def.columnId].push({
							t: moment(d[def.timeId]),
							y: def.getValueY,
						})
					}
				})
			})
			// console.debug('data in get datasets for chartData', data)

			const result = {
				datasets: [],
			}
			this.definition.forEach(set => {
				const push = {
					label: set.title,
					data: data[set.columnId],
				}
				if ('backgroundColor' in set) { push.backgroundColor = set.backgroundColor }
				if ('borderColor' in set) { push.borderColor = set.borderColor }
				if ('borderDash' in set) { push.borderDash = set.borderDash }
				if ('borderWidth' in set) { push.borderWidth = set.borderWidth }
				if ('fill' in set) { push.fill = set.fill }
				if ('type' in set) { push.type = set.type }

				if (set.show) {
					result.datasets.push(push)
				}
			})

			// console.debug('chartData', result)
			return result
		},
		isDetailRange: function() {
			return !(this.rangeDefinition === 'week' || this.rangeDefinition === 'month' || this.rangeDefinition === 'year')
		},
		rangeDays: function() {
			if (this.range === 'week') {
				return 7
			} else if (this.range === 'month') {
				return 31
			} else if (this.range === 'year') {
				return 365
			} else {
				return -1
			}
		},
		rangeHours: function() {
			if (this.range === '1hour') {
				return 1
			} else if (this.range === '4hours') {
				return 4
			} else if (this.range === '12hours') {
				return 12
			} else if (this.range === '24hours') {
				return 24
			} else if (this.range === '48hours') {
				return 48
			} else {
				return -1
			}
		},
	},
	methods: {
		isInTimeRange: function(date) {
			if (this.rangeDays !== -1 && !this.isDetailRange) {
				return Math.abs(moment(date).diff(moment(), 'days')) <= this.rangeDays
			} else if (this.rangeHours !== -1 && this.isDetailRange) {
				return Math.abs(moment(date).diff(moment(), 'hours')) <= this.rangeHours
			} else {
				return true
			}
		},
	},
}
</script>
<style lang="scss" scoped>
	.empty-content {
		margin-top: 0 !important;
		margin-bottom: 20px;
	}

	select {
		margin-bottom: 15px;
	}
</style>
