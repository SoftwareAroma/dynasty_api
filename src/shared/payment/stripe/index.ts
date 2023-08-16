import Stripe from 'stripe';
import {STRIPE_SECRET_KEY} from "@common/environment";

export const stripe = new Stripe(STRIPE_SECRET_KEY, {
    apiVersion: "2022-11-15",
    maxNetworkRetries: 1,
    timeout: 1000
})
