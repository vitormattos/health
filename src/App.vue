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
	<Content :class="{'icon-loading': loading}" app-name="health">
		<PersonsNavigation />
		<AppContent>
			<div class="top-bar" />
			<div class="content-menu-topright">
				<Actions :title="'Details'">
					<ActionButton icon="icon-menu-sidebar" @click="$store.commit('showSidebar', !showSidebar)" />
				</Actions>
			</div>
			<h3 v-if="person && person.name" class="icon-user h3-icon">
				{{ person.name }}
			</h3>
			<PersonsContent v-if="person && activeModule === 'person'" />
			<WeightContent v-if="person && activeModule === 'weight' && person.enabledModuleWeight" />
			<FeelingContent v-if="person && activeModule === 'feeling' && person.enabledModuleFeeling" />
			<MeasurementContent v-if="person && activeModule === 'measurement' && person.enabledModuleMeasurement" />
			<SleepContent v-if="person && activeModule === 'sleep' && person.enabledModuleSleep" />
			<SmokingContent v-if="person && activeModule === 'smoking' && person.enabledModuleSmoking" />
		</AppContent>
		<AppSidebar
			v-show="showSidebar"
			v-if="person && !loading"
			:title="person.name"
			:subtitle="t('health', 'created at {creationTime}', { creationTime: formatMyDate(person.insertTime) })"
			@close="$store.commit('showSidebar', false)">
			<AppSidebarTab
				id="person"
				name="Person"
				icon="icon-user"
				:order="0">
				<PersonsSidebar />
			</AppSidebarTab>
			<AppSidebarTab
				v-if="person.enabledModuleWeight"
				id="weight"
				:name="t('health', 'Weight', {})"
				icon="icon-quota"
				:order="1">
				<WeightSidebar />
			</AppSidebarTab>
			<AppSidebarTab
				v-if="person.enabledModuleFeeling"
				id="feeling"
				:name="t('health', 'Feeling')"
				icon="icon-category-monitoring"
				:order="2">
				<FeelingSidebar />
			</AppSidebarTab>
			<AppSidebarTab
				v-if="person.enabledModuleMeasurement"
				id="measurement"
				:name="t('health', 'Measurementdata')"
				icon="icon-home"
				:order="3">
				<MeasurementSidebar />
			</AppSidebarTab>
			<AppSidebarTab
				v-if="person.enabledModuleSleep"
				id="sleep"
				:name="t('health', 'Sleep')"
				icon="icon-download"
				:order="4">
				<SleepSidebar />
			</AppSidebarTab>
			<AppSidebarTab
				v-if="person.enabledModuleSmoking"
				id="smoking"
				:name="t('health', 'Smoking')"
				icon="icon-address"
				:order="5">
				<SmokingSidebar />
			</AppSidebarTab>
		</AppSidebar>
	</Content>
</template>

<script>
import Content from '@nextcloud/vue/dist/Components/Content'
import AppContent from '@nextcloud/vue/dist/Components/AppContent'
import AppSidebar from '@nextcloud/vue/dist/Components/AppSidebar'
import AppSidebarTab from '@nextcloud/vue/dist/Components/AppSidebarTab'
import PersonsNavigation from './modules/persons/PersonsNavigation'
import PersonsSidebar from './modules/persons/PersonsSidebar'
import WeightSidebar from './modules/weight/WeightSidebar'
import FeelingSidebar from './modules/feeling/FeelingSidebar'
import ActionButton from '@nextcloud/vue/dist/Components/ActionButton'
import Actions from '@nextcloud/vue/dist/Components/Actions'
import WeightContent from './modules/weight/WeightContent'
import FeelingContent from './modules/feeling/FeelingContent'
import { mapState, mapGetters } from 'vuex'
import PersonsContent from './modules/persons/PersonsContent'
import SleepContent from './modules/sleep/SleepContent'
import MeasurementContent from './modules/measurement/MeasurementContent'
import MeasurementSidebar from './modules/measurement/MeasurementSidebar'
import SleepSidebar from './modules/sleep/SleepSidebar'
import moment from '@nextcloud/moment'
import SmokingSidebar from './modules/smoking/SmokingSidebar'
import SmokingContent from './modules/smoking/SmokingContent'

export default {
	name: 'App',
	components: {
		MeasurementContent,
		SleepContent,
		MeasurementSidebar,
		SleepSidebar,
		Content,
		AppContent,
		AppSidebar,
		AppSidebarTab,
		ActionButton,
		Actions,
		PersonsNavigation,
		WeightSidebar,
		FeelingSidebar,
		PersonsSidebar,
		WeightContent,
		FeelingContent,
		PersonsContent,
		SmokingSidebar,
		SmokingContent,
	},
	data: function() {
		return {
			loading: true,
		}
	},
	computed: {
		...mapState(['activePersonId', 'activeModule', 'showSidebar', 'persons']),
		...mapGetters(['person']),
	},
	async beforeMount() {
		this.loading = true
		await this.$store.dispatch('loadPersons')
		this.loading = false
	},
	methods: {
		formatMyDate: function(v) {
			return moment(v).format('DD.MM.YYYY')
		},
	},
}
</script>
<style lang="scss">

	.content-wrapper {
		padding: 35px 10px 10px 10px;
	}

	.top-bar {
		width: 100%;
		height: 35px;
		position: fixed;
		z-index: inherit;
		background: var(--color-main-background);
	}

	.detailsMainInfo {
		padding: 10px;
	}

	.content-menu-topright {
		position: fixed;
		right: 0px;
		z-index: 1001;
	}

	h2 {
		margin-top: -10px;
		font-size: x-large;
	}

	h3 {
		font-size: 20px;
		margin-top: 40px;
	}

	h4 {
		font-size: large;
		font-weight: 300;
		margin-bottom: 20px;
		margin-top: 10px;
	}

	.h3-icon {
		background-position: left;
		padding-left: 20px;
		opacity: 0.4;
	}

	.content-wrapper h3:first-child {
		margin-top: 2px;
	}

	.content-wrapper span {
		opacity: .7;
		font-size: 0.8em;
		margin-left: 5px;
	}

	.app-content {
		padding-left: 15px;
	}

	.app-sidebar-tabs h3 {
		border-bottom: 1px solid #80808057;
	}

	.green {
		color: #19880C;
	}

	.red {
		color: #bd1500;
	}
</style>
