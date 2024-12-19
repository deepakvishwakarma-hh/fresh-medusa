import { defineEventHandler, readBody } from 'h3'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const { tapId } = await readBody(event)

  console.log('Received tapId:', tapId)

  if (!tapId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing tap_id'
    })
  }

  try {
    console.log('Fetching invoice from Tap API...')
    const response = await fetch(`https://api.tap.company/v2/invoices/${tapId}`, {
      headers: {
        'Authorization': `Bearer ${config.TAP_API_KEY}`
      }
    })

    const data = await response.json()
    console.log('Tap API response:', JSON.stringify(data, null, 2))

    if (!response.ok) {
      throw createError({
        statusCode: response.status,
        statusMessage: data.message || 'Failed to check payment status'
      })
    }

    if (data.status === 'PAID') {
      console.log('Payment status is PAID. Updating proposal in Strapi...')
      const proposalId = data.reference?.order
      if (proposalId) {
        const strapiUrl = `${config.STRAPI_URL}/api/proposals/${proposalId}`
        console.log('Strapi update URL:', strapiUrl)
        
        const updateResponse = await fetch(strapiUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.STRAPI_API_TOKEN}`
          },
          body: JSON.stringify({
            data: {
              status: 'paid',
              tap_invoice_id: tapId
            }
          })
        })

        if (!updateResponse.ok) {
          const errorText = await updateResponse.text()
          console.error('Failed to update proposal status in Strapi:', errorText)
          console.error('Strapi response status:', updateResponse.status)
          throw new Error(`Failed to update proposal status: ${updateResponse.statusText}`)
        } else {
          const updatedProposal = await updateResponse.json()
          console.log('Successfully updated proposal in Strapi:', JSON.stringify(updatedProposal, null, 2))
        }
      } else {
        console.warn('No proposal ID found in Tap invoice reference.order')
      }
    } else {
      console.log(`Payment status is ${data.status}. No update needed.`)
    }

    return { status: data.status }
  } catch (error) {
    console.error('Error in check-payment-status:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to process payment status'
    })
  }
})