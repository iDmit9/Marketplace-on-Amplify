import format from 'date-fns/format'

export const convertDollarsToCents = price => (price * 100).toFixed(0);

export const convertCentsToDollars = price => (price / 100).toFixed(2);

export const formatProductDate = date => format(new Date(date), 'MMM do, yyyy');

export const formatOrderDate = date => format(new Date(date), 'E h:mm a, MMM do, yyyy');