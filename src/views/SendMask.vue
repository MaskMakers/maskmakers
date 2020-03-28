<template>
  <div class="hospital-list-container basic-page-container">
    <h1>Send A Mask</h1>
    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in</p>
     <p>
        This data was provided by <a href="https://publichealth.berkeley.edu/" target="_blank">UC Berkeley School of Public Health</a>.
        If you would like to view their document directly, please <a href="https://docs.google.com/document/d/12a5YO0Z9RpHZk9Zkzl4NOj9CbjzhFfoKjPLFFC-21LU/preview#heading=h.o8glz8qqtcdo" target="_blank">click here</a>,
        or email <a href="mailto:we.need.handmade.masks@gmail.com" target="_blank">we.need.handmade.masks@gmail.com</a> for more info!
      </p>
    <div class="actions-container">
      <div class="search-container">
        <input class="input-search" v-model="searchText" placeholder="Search Hospitals" @keyup="updatePageAndURL()" />
        <span v-if="currentHospitalsPageData.length > 0">{{ hospitals.length }} hospitals in need</span>
      </div>
      <select v-model="pageSize" @change="updatePageAndURL()">
        <option v-for="option in pageSizeOptions" :key="option">{{ option }}</option>
      </select>
    </div>
    <div class="list-container">
      <div class="list">
        <div class="list-header">
          <h3 class="name">Facility Name</h3>
          <h3 class="address">Facility Address</h3>
          <h3 class="state">Facility State</h3>
          <h3 class="phone">Facility Phone</h3>
          <h3 class="need">Quantity Needed</h3>
          <h3 class="pattern">Pattern Request?</h3>
          <h3 class="delivery">Delivery Instructions</h3>
        </div>
        <div v-if="hospitals.length > 0">
          <div v-if="currentHospitalsPageData.length > 0">
            <div class="list-item" v-for="({ name, address, state, phone, need, pattern, delivery }, i) in currentHospitalsPageData" :key="i">
              <div class="name">{{ name }}</div>
              <div class="address">{{ address }}</div>
              <div class="state">{{ state }}</div>
              <div class="phone">{{ phone }}</div>
              <div class="need">{{ need }}</div>
              <div class="pattern">{{ pattern }}</div>
              <div class="delivery">{{ delivery }}</div>
            </div>
          </div>
          <p v-else>No results for '{{ searchText }}'</p>
        </div>
        <loading v-else />
      </div>
    </div>
    <div class="pagination" v-if="paginatedHospitalsLength > 1">
      <button @click="goToPage('back')">&lt;</button>
      <button
        v-for="page in paginatedHospitalsLength"
        :key="page"
        @click="goToPage(page)"
        :class="{ 'active' : page - 1 === currentPage }"
      >
        {{ page }}
      </button>
      <button @click="goToPage('forward')">&gt;</button>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'SendMask',

  data () {
    return {
      currentPage: 0,
      pageSize: 50,
      pageSizeOptions: [
        5,
        10,
        25,
        50,
        100,
        500,
        1000
      ],
      searchText: decodeURI(window.location.search.replace('?search=', ''))
    }
  },

  computed: {
    ...mapState('tabletop', [
      'hospitals'
    ]),

    filteredHospitals () {
      const searchText = this.searchText && this.searchText.toLowerCase().trim()

      if (searchText && this.hospitals.length > 0) {
        return this.hospitals.filter(row => Object.keys(row).some(key => String(row[key]).toLowerCase().indexOf(searchText) > -1))
      }

      return this.hospitals
    },

    paginatedHospitals () {
      // Splice array into chunks
      if (this.filteredHospitals.length > 0 && this.pageSize !== 'All') {
        return this.filteredHospitals.reduce((resultArray, item, index) => {
          const chunkIndex = Math.floor(index / this.pageSize)

          if (!resultArray[chunkIndex]) {
            resultArray[chunkIndex] = []
          }

          resultArray[chunkIndex].push(item)

          return resultArray
        }, [])
      }

      return this.filteredHospitals
    },

    currentHospitalsPageData () {
      return this.paginatedHospitals[this.currentPage] || []
    },

    paginatedHospitalsLength () {
      return this.paginatedHospitals && this.paginatedHospitals.length
    }
  },

  methods: {
    goToPage (pageIndex) {
      if (pageIndex === 'back') {
        if (this.currentPage <= 0) {
          this.currentPage = this.paginatedHospitalsLength - 1
        } else {
          this.currentPage = this.currentPage - 1
        }
      } else if (pageIndex === 'forward') {
        if (this.currentPage >= this.paginatedHospitalsLength - 1) {
          this.currentPage = 0
        } else {
          this.currentPage = this.currentPage + 1
        }
      } else {
        this.currentPage = pageIndex - 1
      }

      document.querySelector('.list-header').scrollIntoView({ behavior: 'smooth' })
    },

    updatePageAndURL () {
      let query = window.location.protocol + '//' + window.location.host + window.location.pathname

      if (this.searchText !== '') {
        query += '?search=' + this.searchText
      }

      window.history.replaceState(null, null, query)

      this.currentPage = 0
    }
  }
}
</script>

<style lang="scss" scoped>
.hospital-list-container {
  margin-top: 50px;
}

.actions-container {
  width: 100%;
  padding: 0;
  margin: 100px 0 0;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  box-sizing: border-box;

  .search-container {
    text-align: left;
    flex-grow: 1;

    input {
      width: 25%;
      min-width: 170px;
      margin-right: 1rem;
    }

    span {
      font-size: 0.9em;
      color: $red;
      white-space: nowrap;
    }
  }

}

.list-container {
  margin-top: 30px;
  overflow-y: scroll;

  .list {
    min-width: 1000px;
  }
}

p {
  max-width: 800px;
  margin: 20px auto;
}

.list-item, .list-header {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr 2fr;
  grid-column-gap: 1.5em;
  padding: 0.75em 0;
  text-align: left;

  &:last-of-type {
    border-bottom: 0;
  }

  &.list-header {
    font-weight: bold;
  }
}

.list-item {
  font-size: 0.9em;
}

.pagination {
  margin-top: 20px;

  button {
    margin: 0 6px;
    padding: 0;
    width: 30px;
    height: 30px;
  }
}
</style>