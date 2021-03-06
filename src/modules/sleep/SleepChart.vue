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
		<Chart
			:chart-style="chartStyle"
			:data="data"
			:definition="setDefinitions"
			:options="options" />
	</div>
</template>

<script>
import Chart from '../../general/Chart'
import moment from '@nextcloud/moment'

export default {
	name: 'SleepChart',
	components: {
		Chart,
	},
	props: {
		data: {
			type: Array,
			default: null,
		},
		person: {
			type: Object,
			default: null,
		},
	},
	computed: {
		setDefinitions: function() {
			return [
				{
					title: t('health', 'Duration', {}),
					columnId: 'duration',
					timeId: 'asleep',
					valueId: 'calculate',
					getValueY: function(dataset) {
						if (!dataset || !dataset.asleep || !dataset.wakeup) {
							console.debug('dataset not good')
							return ''
						}
						const start = moment(dataset.asleep)
						const end = moment(dataset.wakeup)
						// console.debug('start & end', { start: start, end: end })
						if (end >= start) {
							let duration = moment.duration(end.diff(start))
							if ('durationWakeups' in dataset && dataset.durationWakeups) {
								duration = duration.subtract(dataset.durationWakeups, 'minutes')
							}
							console.debug('duration', { duration: duration, h: duration.asHours(), m: duration.asMinutes() })
							return duration.isValid() ? duration.asHours() : ''
						}
						return ''
					},
					borderColor: 'rgb(0,11,105)',
					backgroundColor: 'rgb(106,113,159)',
					borderWidth: 2,
					fill: true,
					type: 'bar',
					show: true,
				},
				{
					title: t('health', 'Quality', {}),
					columnId: 'quality',
					timeId: 'asleep',
					valueId: 'quality',
					getValueY: function(v) {
						const maxIndex = 4
						return Math.round((v + 1) / (maxIndex + 1) * 5)
					},
					borderColor: 'darkgreen',
					borderWidth: 2,
					fill: true,
					show: this.person.sleepColumnQuality,
				},
				{
					title: t('health', 'Counted wakeups', {}),
					columnId: 'countedWakeups',
					timeId: 'asleep',
					valueId: 'countedWakeups',
					getValueY: function(v) {
						return v * 2
					},
					borderColor: 'rgb(115,32,32)',
					borderWidth: 2,
					fill: true,
					show: this.person.sleepColumnWakeups,
				},
			]
		},
		options: function() {
			return {
				title: {
					text: t('health', 'Chart'),
				},
				responsive: true,
				maintainAspectRatio: false,
				scales: {
					xAxes: [
						{
							type: 'time',
							time: {
								minUnit: 'day',
							},
						},
					],
					yAxes: [
						{
							gridLines: {
								display: true,
								color: 'gray',
								z: 100,
								lineWidth: 1,
							},
							scaleLabel: {
								display: true,
								labelString: t('health', 'Values'),
							},
							min: 0,
							max: 100,
						},
					],
				},
				tooltips: {
					enabled: true,
				},
				layout: {
					padding: {
						right: 30,
						left: 25,
					},
				},
				legend: {
					position: 'bottom',
				},
			}
		},
		chartStyle() {
			return {
				height: '250px',
			}
		},
	},
}
</script>
