#!/usr/bin/env node

/**
 * This is a test script specifically for testing the GET_USER_BALANCES
 * operation with array-based response format.
 *
 * Usage:
 * node test-balances-pagination.js
 */

const mockBalancesResponse = (page, totalItems = 600) => {
  // Calculate how many items to return on this page
  const pageSize = 500
  const startIndex = (page - 1) * pageSize
  const itemsOnThisPage = Math.min(pageSize, totalItems - startIndex)

  // Create mock data for this page
  const data = []
  for (let i = 0; i < itemsOnThisPage; i++) {
    const itemIndex = startIndex + i
    data.push({
      asset: `ASSET${itemIndex}`,
      free: Math.random() * 100,
      locked: Math.random() * 10,
      exchangeCode: itemIndex % 2 === 0 ? "binance" : "bitget",
      exchangeMarket: "spot",
      exchangeId: `ex-${itemIndex}`,
    })
  }

  // Return the array-based response format
  return [
    {
      data: data,
      // Include pagination info only in the test mock to verify both methods work
      pagination: {
        page: page,
        totalPages: Math.ceil(totalItems / pageSize),
        totalResults: totalItems,
      },
    },
  ]
}

// Mock the n8n helpers.request function
const mockRequest = async (options) => {
  // Extract page from the URL
  const url = options.url
  const pageMatch = url.match(/page=(\d+)/)
  const page = pageMatch ? parseInt(pageMatch[1]) : 1

  console.log(`Mock API request for page ${page}`)

  // Return mock response based on page
  return mockBalancesResponse(page)
}

// Mock the GET_USER_BALANCES implementation (simplified)
const testGetUserBalances = async () => {
  console.log("Testing GET_USER_BALANCES pagination...")

  let allBalances = []
  let page = 1
  let hasMorePages = true
  let currentPageSize = 0
  const PAGE_SIZE_THRESHOLD = 500

  console.log(`Starting to fetch all balances, paging through results...`)

  // Continue fetching pages until we get fewer than 500 items or error occurs
  while (hasMorePages) {
    const pageQs = `?page=${page}`

    try {
      console.log(`Fetching balances page ${page}...`)

      // Make the request for this page (using our mock function)
      const pageResponse = await mockRequest({
        url: `https://api.gainium.com/api/user/balances${pageQs}`,
        method: "GET",
        headers: {
          /* mock headers */
        },
      })

      console.log(
        `Page ${page} response structure: ${JSON.stringify(
          pageResponse ? typeof pageResponse : "undefined"
        )}`
      )

      // Handle the unique array-based response structure for balances
      if (Array.isArray(pageResponse)) {
        // The response is an array, check if it has the expected structure
        if (pageResponse.length > 0) {
          // Extract the data array from the first element
          const firstElement = pageResponse[0]

          if (
            firstElement &&
            firstElement.data &&
            Array.isArray(firstElement.data)
          ) {
            // Get the data for this page
            const pageData = firstElement.data
            currentPageSize = pageData.length
            console.log(`Page ${page} contains ${currentPageSize} items`)

            // Add the items to our collection
            allBalances = allBalances.concat(pageData)

            // Check for explicit pagination info
            if (firstElement.pagination) {
              const pagination = firstElement.pagination

              if (
                pagination.page !== undefined &&
                pagination.totalPages !== undefined &&
                pagination.page < pagination.totalPages
              ) {
                // There are more pages according to pagination info
                console.log(
                  `More pages available based on pagination info: ${pagination.page}/${pagination.totalPages}`
                )
                page++
                continue
              }
            }

            // If no explicit pagination or no more pages, use page size to determine if more pages exist
            if (currentPageSize >= PAGE_SIZE_THRESHOLD) {
              // We received a full page, which means there might be more data
              console.log(
                `Page ${page} contains ${currentPageSize} items (equal to threshold), checking for more pages...`
              )
              page++
            } else {
              // We received fewer items than the threshold, this is likely the last page
              console.log(
                `Page ${page} has fewer than ${PAGE_SIZE_THRESHOLD} items (${currentPageSize}), no more pages needed`
              )
              hasMorePages = false
            }
          } else {
            // The first element doesn't have a data array
            console.log(
              `Response is an array but doesn't match expected structure, stopping pagination`
            )
            console.log(
              `First element structure: ${JSON.stringify(
                firstElement ? Object.keys(firstElement) : "undefined"
              )}`
            )
            hasMorePages = false
          }
        } else {
          // Empty array response
          console.log(
            `Received empty array response on page ${page}, stopping pagination`
          )
          hasMorePages = false
        }
      } else {
        // Unexpected response format
        console.log(
          `Unexpected response format on page ${page}, stopping pagination`
        )
        console.log(
          `Response structure: ${JSON.stringify(
            pageResponse ? Object.keys(pageResponse) : "undefined"
          )}`
        )
        hasMorePages = false
      }
    } catch (error) {
      console.log(`Error fetching page ${page}: ${error}`)
      hasMorePages = false
    }
  }

  console.log(`Total balances aggregated: ${allBalances.length}`)

  // After collecting all balances, check the final response structure
  console.log("Testing the response format...")

  // This is the structure we should get after our changes
  const expectedFormat = {
    data: allBalances, // Direct array of balance items
    pagination: {
      page: page,
      totalPages: page,
      totalResults: allBalances.length,
    },
  }

  console.log(
    `Expected response format: ${JSON.stringify(Object.keys(expectedFormat))}`
  )
  console.log(`Expected data structure: Array with ${allBalances.length} items`)

  console.log("----------------------------------------")
  console.log("Testing complete!")
  console.log("Expected: 600 items in a clean format")
  console.log(`Actual: ${allBalances.length} items`)
  console.log(
    `Status: ${allBalances.length === 600 ? "✅ SUCCESS" : "❌ FAILED"}`
  )
}

// Run the test
testGetUserBalances()
