import { defineEventHandler, readBody } from 'h3'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)
  console.log('Received request body:', JSON.stringify(body, null, 2))

  const { amount, currency, customer, proposal } = body

  if (!amount || !currency || !customer || !proposal) {
    console.error('Missing required fields in request body')
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required fields in request body'
    })
  }

  const TAP_API_KEY = config.TAP_API_KEY
  const APP_URL = config.public.APP_URL
  const STRAPI_URL = config.STRAPI_URL
  const STRAPI_API_TOKEN = config.STRAPI_API_TOKEN

  if (!TAP_API_KEY || !APP_URL || !STRAPI_URL || !STRAPI_API_TOKEN) {
    console.error('Missing environment variables:', {
      TAP_API_KEY: !!TAP_API_KEY,
      APP_URL: !!APP_URL,
      STRAPI_URL: !!STRAPI_URL,
      STRAPI_API_TOKEN: !!STRAPI_API_TOKEN
    })
    throw createError({
      statusCode: 500,
      statusMessage: 'Server configuration error'
    })
  }

  const proposalLink = `${APP_URL}/proposal/${proposal.id}`

  try {
    console.log('Sending request to Tap API:', JSON.stringify({
      amount, currency, customer, proposal
    }, null, 2))

    const response = await fetch('https://api.tap.company/v2/invoices/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TAP_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        draft: false,
        due: Date.now() + 7 * 24 * 60 * 60 * 1000,
        expiry: Date.now() + 30 * 24 * 60 * 60 * 1000,
        description: `${proposal.title}\n\nView proposal: ${proposalLink}`,
        mode: "INVOICEPAY",
        note: "Invoice for proposal",
        notifications: {
          channels: ["SMS", "EMAIL"],
          dispatch: true
        },
        currencies: [currency],
        charge: {
          receipt: {
            email: true,
            sms: true
          },
          statement_descriptor: "Proposal payment"
        },
        customer: {
          email: customer.email,
          first_name: customer.first_name,
          last_name: customer.last_name,
          phone: {
            country_code: customer.phone.split('+')[1].slice(0, 3),
            number: customer.phone.split('+')[1].slice(3)
          }
        },
        order: {
          amount: amount,
          currency: currency,
          items: [
            {
              amount: amount,
              currency: currency,
              description: proposal.title,
              name: proposal.title,
              quantity: 1
            }
          ]
        },
        post: {
          url: `${APP_URL}/api/payment-callback`
        },
        redirect: {
          url: `${APP_URL}/payment-callback`
        },
        reference: {
          order: proposal.id.toString() // Ensure it's a string
        },
        metadata: {
          proposal_link: proposalLink
        }
      })
    })

    const data = await response.json()

    console.log('Received response from Tap API:', JSON.stringify(data, null, 2))

    if (!response.ok) {
      throw createError({
        statusCode: response.status,
        statusMessage: data.message || 'Failed to create invoice'
      })
    }

    // Save the invoice ID to the proposal
    console.log(`Updating proposal in Strapi: ${STRAPI_URL}/api/proposals/${proposal.id}`)
    try {
      const updateResponse = await fetch(`${STRAPI_URL}/api/proposals/${proposal.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${STRAPI_API_TOKEN}`
        },
        body: JSON.stringify({
          data: {
            tap_invoice_id: data.id,
            tap_invoice_url: data.short_url
          }
        })
      })

      if (!updateResponse.ok) {
        const errorText = await updateResponse.text()
        console.error('Failed to update proposal with invoice ID', errorText)
        console.error('Response status:', updateResponse.status)
        console.error('Response headers:', updateResponse.headers)
      } else {
        console.log('Successfully updated proposal with invoice ID')
        const updatedProposal = await updateResponse.json()
        console.log('Updated proposal:', JSON.stringify(updatedProposal, null, 2))
      }
    } catch (error) {
      console.error('Error updating proposal:', error)
    }

    return { url: data.url, invoiceId: data.id }
  } catch (error) {
    console.error('Error creating invoice:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to create invoice'
    })
  }
})
