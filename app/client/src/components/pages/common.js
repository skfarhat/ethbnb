import _ from 'lodash'

export const stateOptions = [
  { key: 'AL', value: 'AL', text: 'Alabama' },
  { key: 'AK', value: 'AK', text: 'Alaska' },
  { key: 'AZ', value: 'AZ', text: 'Arizona' },
  { key: 'AR', value: 'AR', text: 'Arkansas' },
  { key: 'CA', value: 'CA', text: 'California' },
  { key: 'CO', value: 'CO', text: 'Colorado' },
  { key: 'CT', value: 'CT', text: 'Connecticut' },
  { key: 'DE', value: 'DE', text: 'Delaware' },
  { key: 'DC', value: 'DC', text: 'District Of Columbia' },
  { key: 'FL', value: 'FL', text: 'Florida' },
  { key: 'GA', value: 'GA', text: 'Georgia' },
  { key: 'HI', value: 'HI', text: 'Hawaii' },
  { key: 'ID', value: 'ID', text: 'Idaho' },
  { key: 'IL', value: 'IL', text: 'Illinois' },
  { key: 'IN', value: 'IN', text: 'Indiana' },
  { key: 'IA', value: 'IA', text: 'Iowa' },
  { key: 'KS', value: 'KS', text: 'Kansas' },
  { key: 'KY', value: 'KY', text: 'Kentucky' },
  { key: 'LA', value: 'LA', text: 'Louisiana' },
  { key: 'ME', value: 'ME', text: 'Maine' },
  { key: 'MD', value: 'MD', text: 'Maryland' },
  { key: 'MA', value: 'MA', text: 'Massachusetts' },
  { key: 'MI', value: 'MI', text: 'Michigan' },
  { key: 'MN', value: 'MN', text: 'Minnesota' },
  { key: 'MS', value: 'MS', text: 'Mississippi' },
  { key: 'MO', value: 'MO', text: 'Missouri' },
  { key: 'MT', value: 'MT', text: 'Montana' },
  { key: 'NE', value: 'NE', text: 'Nebraska' },
  { key: 'NV', value: 'NV', text: 'Nevada' },
  { key: 'NH', value: 'NH', text: 'New Hampshire' },
  { key: 'NJ', value: 'NJ', text: 'New Jersey' },
  { key: 'NM', value: 'NM', text: 'New Mexico' },
  { key: 'NY', value: 'NY', text: 'New York' },
  { key: 'NC', value: 'NC', text: 'North Carolina' },
  { key: 'ND', value: 'ND', text: 'North Dakota' },
  { key: 'OH', value: 'OH', text: 'Ohio' },
  { key: 'OK', value: 'OK', text: 'Oklahoma' },
  { key: 'OR', value: 'OR', text: 'Oregon' },
  { key: 'PA', value: 'PA', text: 'Pennsylvania' },
  { key: 'RI', value: 'RI', text: 'Rhode Island' },
  { key: 'SC', value: 'SC', text: 'South Carolina' },
  { key: 'SD', value: 'SD', text: 'South Dakota' },
  { key: 'TN', value: 'TN', text: 'Tennessee' },
  { key: 'TX', value: 'TX', text: 'Texas' },
  { key: 'UT', value: 'UT', text: 'Utah' },
  { key: 'VT', value: 'VT', text: 'Vermont' },
  { key: 'VA', value: 'VA', text: 'Virginia' },
  { key: 'WA', value: 'WA', text: 'Washington' },
  { key: 'WV', value: 'WV', text: 'West Virginia' },
  { key: 'WI', value: 'WI', text: 'Wisconsin' },
  { key: 'WY', value: 'WY', text: 'Wyoming' },
]

export const friendOptions = [
  {
    key: 'Jenny Hess',
    text: 'Jenny Hess',
    value: 'Jenny Hess',
    image: { avatar: true, src: '/images/avatar/small/jenny.jpg' },
  },
  {
    key: 'Elliot Fu',
    text: 'Elliot Fu',
    value: 'Elliot Fu',
    image: { avatar: true, src: '/images/avatar/small/elliot.jpg' },
  },
  {
    key: 'Stevie Feliciano',
    text: 'Stevie Feliciano',
    value: 'Stevie Feliciano',
    image: { avatar: true, src: '/images/avatar/small/stevie.jpg' },
  },
  {
    key: 'Christian',
    text: 'Christian',
    value: 'Christian',
    image: { avatar: true, src: '/images/avatar/small/christian.jpg' },
  },
  {
    key: 'Matt',
    text: 'Matt',
    value: 'Matt',
    image: { avatar: true, src: '/images/avatar/small/matt.jpg' },
  },
  {
    key: 'Justen Kitsune',
    text: 'Justen Kitsune',
    value: 'Justen Kitsune',
    image: { avatar: true, src: '/images/avatar/small/justen.jpg' },
  },
]

export const countryOptions = [
  { code: 0, key: 'af', value: 'af', flag: 'af', text: 'Afghanistan' },
  { code: 1, key: 'ax', value: 'ax', flag: 'ax', text: 'Aland Islands' },
  { code: 2, key: 'al', value: 'al', flag: 'al', text: 'Albania' },
  { code: 3, key: 'dz', value: 'dz', flag: 'dz', text: 'Algeria' },
  { code: 4, key: 'as', value: 'as', flag: 'as', text: 'American Samoa' },
  { code: 5, key: 'ad', value: 'ad', flag: 'ad', text: 'Andorra' },
  { code: 6, key: 'ao', value: 'ao', flag: 'ao', text: 'Angola' },
  { code: 7, key: 'ai', value: 'ai', flag: 'ai', text: 'Anguilla' },
  { code: 8, key: 'ag', value: 'ag', flag: 'ag', text: 'Antigua' },
  { code: 9, key: 'ar', value: 'ar', flag: 'ar', text: 'Argentina' },
  { code: 10, key: 'am', value: 'am', flag: 'am', text: 'Armenia' },
  { code: 11, key: 'aw', value: 'aw', flag: 'aw', text: 'Aruba' },
  { code: 12, key: 'au', value: 'au', flag: 'au', text: 'Australia' },
  { code: 13, key: 'at', value: 'at', flag: 'at', text: 'Austria' },
  { code: 14, key: 'az', value: 'az', flag: 'az', text: 'Azerbaijan' },
  { code: 15, key: 'bs', value: 'bs', flag: 'bs', text: 'Bahamas' },
  { code: 16, key: 'bh', value: 'bh', flag: 'bh', text: 'Bahrain' },
  { code: 17, key: 'bd', value: 'bd', flag: 'bd', text: 'Bangladesh' },
  { code: 18, key: 'bb', value: 'bb', flag: 'bb', text: 'Barbados' },
  { code: 19, key: 'by', value: 'by', flag: 'by', text: 'Belarus' },
  { code: 20, key: 'be', value: 'be', flag: 'be', text: 'Belgium' },
  { code: 21, key: 'bz', value: 'bz', flag: 'bz', text: 'Belize' },
  { code: 22, key: 'bj', value: 'bj', flag: 'bj', text: 'Benin' },
  { code: 23, key: 'bm', value: 'bm', flag: 'bm', text: 'Bermuda' },
  { code: 24, key: 'bt', value: 'bt', flag: 'bt', text: 'Bhutan' },
  { code: 25, key: 'bo', value: 'bo', flag: 'bo', text: 'Bolivia' },
  { code: 26, key: 'ba', value: 'ba', flag: 'ba', text: 'Bosnia' },
  { code: 27, key: 'bw', value: 'bw', flag: 'bw', text: 'Botswana' },
  { code: 28, key: 'bv', value: 'bv', flag: 'bv', text: 'Bouvet Island' },
  { code: 29, key: 'br', value: 'br', flag: 'br', text: 'Brazil' },
  { code: 30, key: 'vg', value: 'vg', flag: 'vg', text: 'British Virgin Islands' },
  { code: 31, key: 'bn', value: 'bn', flag: 'bn', text: 'Brunei' },
  { code: 32, key: 'bg', value: 'bg', flag: 'bg', text: 'Bulgaria' },
  { code: 33, key: 'bf', value: 'bf', flag: 'bf', text: 'Burkina Faso' },
  { code: 34, key: 'bi', value: 'bi', flag: 'bi', text: 'Burundi' },
  { code: 35, key: 'tc', value: 'tc', flag: 'tc', text: 'Caicos Islands' },
  { code: 36, key: 'kh', value: 'kh', flag: 'kh', text: 'Cambodia' },
  { code: 37, key: 'cm', value: 'cm', flag: 'cm', text: 'Cameroon' },
  { code: 38, key: 'ca', value: 'ca', flag: 'ca', text: 'Canada' },
  { code: 39, key: 'cv', value: 'cv', flag: 'cv', text: 'Cape Verde' },
  { code: 40, key: 'ky', value: 'ky', flag: 'ky', text: 'Cayman Islands' },
  { code: 41, key: 'cf', value: 'cf', flag: 'cf', text: 'Central African Republic' },
  { code: 42, key: 'td', value: 'td', flag: 'td', text: 'Chad' },
  { code: 43, key: 'cl', value: 'cl', flag: 'cl', text: 'Chile' },
  { code: 44, key: 'cn', value: 'cn', flag: 'cn', text: 'China' },
  { code: 45, key: 'cx', value: 'cx', flag: 'cx', text: 'Christmas Island' },
  { code: 46, key: 'cc', value: 'cc', flag: 'cc', text: 'Cocos Islands' },
  { code: 47, key: 'co', value: 'co', flag: 'co', text: 'Colombia' },
  { code: 48, key: 'km', value: 'km', flag: 'km', text: 'Comoros' },
  { code: 49, key: 'cg', value: 'cg', flag: 'cg', text: 'Congo Brazzaville' },
  { code: 50, key: 'cd', value: 'cd', flag: 'cd', text: 'Congo' },
  { code: 51, key: 'ck', value: 'ck', flag: 'ck', text: 'Cook Islands' },
  { code: 52, key: 'cr', value: 'cr', flag: 'cr', text: 'Costa Rica' },
  { code: 53, key: 'ci', value: 'ci', flag: 'ci', text: 'Cote Divoire' },
  { code: 54, key: 'hr', value: 'hr', flag: 'hr', text: 'Croatia' },
  { code: 55, key: 'cu', value: 'cu', flag: 'cu', text: 'Cuba' },
  { code: 56, key: 'cy', value: 'cy', flag: 'cy', text: 'Cyprus' },
  { code: 57, key: 'cz', value: 'cz', flag: 'cz', text: 'Czech Republic' },
  { code: 58, key: 'dk', value: 'dk', flag: 'dk', text: 'Denmark' },
  { code: 59, key: 'dj', value: 'dj', flag: 'dj', text: 'Djibouti' },
  { code: 60, key: 'dm', value: 'dm', flag: 'dm', text: 'Dominica' },
  { code: 61, key: 'do', value: 'do', flag: 'do', text: 'Dominican Republic' },
  { code: 62, key: 'ec', value: 'ec', flag: 'ec', text: 'Ecuador' },
  { code: 63, key: 'eg', value: 'eg', flag: 'eg', text: 'Egypt' },
  { code: 64, key: 'sv', value: 'sv', flag: 'sv', text: 'El Salvador' },
  { code: 65, key: 'gb', value: 'gb', flag: 'gb', text: 'England' },
  { code: 66, key: 'gq', value: 'gq', flag: 'gq', text: 'Equatorial Guinea' },
  { code: 67, key: 'er', value: 'er', flag: 'er', text: 'Eritrea' },
  { code: 68, key: 'ee', value: 'ee', flag: 'ee', text: 'Estonia' },
  { code: 69, key: 'et', value: 'et', flag: 'et', text: 'Ethiopia' },
  { code: 70, key: 'eu', value: 'eu', flag: 'eu', text: 'European Union' },
  { code: 71, key: 'fk', value: 'fk', flag: 'fk', text: 'Falkland Islands' },
  { code: 72, key: 'fo', value: 'fo', flag: 'fo', text: 'Faroe Islands' },
  { code: 73, key: 'fj', value: 'fj', flag: 'fj', text: 'Fiji' },
  { code: 74, key: 'fi', value: 'fi', flag: 'fi', text: 'Finland' },
  { code: 75, key: 'fr', value: 'fr', flag: 'fr', text: 'France' },
  { code: 76, key: 'gf', value: 'gf', flag: 'gf', text: 'French Guiana' },
  { code: 77, key: 'pf', value: 'pf', flag: 'pf', text: 'French Polynesia' },
  { code: 78, key: 'tf', value: 'tf', flag: 'tf', text: 'French Territories' },
  { code: 79, key: 'ga', value: 'ga', flag: 'ga', text: 'Gabon' },
  { code: 80, key: 'gm', value: 'gm', flag: 'gm', text: 'Gambia' },
  { code: 81, key: 'ge', value: 'ge', flag: 'ge', text: 'Georgia' },
  { code: 82, key: 'de', value: 'de', flag: 'de', text: 'Germany' },
  { code: 83, key: 'gh', value: 'gh', flag: 'gh', text: 'Ghana' },
  { code: 84, key: 'gi', value: 'gi', flag: 'gi', text: 'Gibraltar' },
  { code: 85, key: 'gr', value: 'gr', flag: 'gr', text: 'Greece' },
  { code: 86, key: 'gl', value: 'gl', flag: 'gl', text: 'Greenland' },
  { code: 87, key: 'gd', value: 'gd', flag: 'gd', text: 'Grenada' },
  { code: 88, key: 'gp', value: 'gp', flag: 'gp', text: 'Guadeloupe' },
  { code: 89, key: 'gu', value: 'gu', flag: 'gu', text: 'Guam' },
  { code: 90, key: 'gt', value: 'gt', flag: 'gt', text: 'Guatemala' },
  { code: 91, key: 'gw', value: 'gw', flag: 'gw', text: 'Guinea-Bissau' },
  { code: 92, key: 'gn', value: 'gn', flag: 'gn', text: 'Guinea' },
  { code: 93, key: 'gy', value: 'gy', flag: 'gy', text: 'Guyana' },
  { code: 94, key: 'ht', value: 'ht', flag: 'ht', text: 'Haiti' },
  { code: 95, key: 'hm', value: 'hm', flag: 'hm', text: 'Heard Island' },
  { code: 96, key: 'hn', value: 'hn', flag: 'hn', text: 'Honduras' },
  { code: 97, key: 'hk', value: 'hk', flag: 'hk', text: 'Hong Kong' },
  { code: 98, key: 'hu', value: 'hu', flag: 'hu', text: 'Hungary' },
  { code: 99, key: 'is', value: 'is', flag: 'is', text: 'Iceland' },
  { code: 100, key: 'in', value: 'in', flag: 'in', text: 'India' },
  { code: 101, key: 'io', value: 'io', flag: 'io', text: 'Indian Ocean Territory' },
  { code: 102, key: 'id', value: 'id', flag: 'id', text: 'Indonesia' },
  { code: 103, key: 'ir', value: 'ir', flag: 'ir', text: 'Iran' },
  { code: 104, key: 'iq', value: 'iq', flag: 'iq', text: 'Iraq' },
  { code: 105, key: 'ie', value: 'ie', flag: 'ie', text: 'Ireland' },
  { code: 106, key: 'il', value: 'il', flag: 'il', text: 'Israel' },
  { code: 107, key: 'it', value: 'it', flag: 'it', text: 'Italy' },
  { code: 108, key: 'jm', value: 'jm', flag: 'jm', text: 'Jamaica' },
  { code: 109, key: 'jp', value: 'jp', flag: 'jp', text: 'Japan' },
  { code: 110, key: 'jo', value: 'jo', flag: 'jo', text: 'Jordan' },
  { code: 111, key: 'kz', value: 'kz', flag: 'kz', text: 'Kazakhstan' },
  { code: 112, key: 'ke', value: 'ke', flag: 'ke', text: 'Kenya' },
  { code: 113, key: 'ki', value: 'ki', flag: 'ki', text: 'Kiribati' },
  { code: 114, key: 'kw', value: 'kw', flag: 'kw', text: 'Kuwait' },
  { code: 115, key: 'kg', value: 'kg', flag: 'kg', text: 'Kyrgyzstan' },
  { code: 116, key: 'la', value: 'la', flag: 'la', text: 'Laos' },
  { code: 117, key: 'lv', value: 'lv', flag: 'lv', text: 'Latvia' },
  { code: 118, key: 'lb', value: 'lb', flag: 'lb', text: 'Lebanon' },
  { code: 119, key: 'ls', value: 'ls', flag: 'ls', text: 'Lesotho' },
  { code: 120, key: 'lr', value: 'lr', flag: 'lr', text: 'Liberia' },
  { code: 121, key: 'ly', value: 'ly', flag: 'ly', text: 'Libya' },
  { code: 122, key: 'li', value: 'li', flag: 'li', text: 'Liechtenstein' },
  { code: 123, key: 'lt', value: 'lt', flag: 'lt', text: 'Lithuania' },
  { code: 124, key: 'lu', value: 'lu', flag: 'lu', text: 'Luxembourg' },
  { code: 125, key: 'mo', value: 'mo', flag: 'mo', text: 'Macau' },
  { code: 126, key: 'mk', value: 'mk', flag: 'mk', text: 'Macedonia' },
  { code: 127, key: 'mg', value: 'mg', flag: 'mg', text: 'Madagascar' },
  { code: 128, key: 'mw', value: 'mw', flag: 'mw', text: 'Malawi' },
  { code: 129, key: 'my', value: 'my', flag: 'my', text: 'Malaysia' },
  { code: 130, key: 'mv', value: 'mv', flag: 'mv', text: 'Maldives' },
  { code: 131, key: 'ml', value: 'ml', flag: 'ml', text: 'Mali' },
  { code: 132, key: 'mt', value: 'mt', flag: 'mt', text: 'Malta' },
  { code: 133, key: 'mh', value: 'mh', flag: 'mh', text: 'Marshall Islands' },
  { code: 134, key: 'mq', value: 'mq', flag: 'mq', text: 'Martinique' },
  { code: 135, key: 'mr', value: 'mr', flag: 'mr', text: 'Mauritania' },
  { code: 136, key: 'mu', value: 'mu', flag: 'mu', text: 'Mauritius' },
  { code: 137, key: 'yt', value: 'yt', flag: 'yt', text: 'Mayotte' },
  { code: 138, key: 'mx', value: 'mx', flag: 'mx', text: 'Mexico' },
  { code: 139, key: 'fm', value: 'fm', flag: 'fm', text: 'Micronesia' },
  { code: 140, key: 'md', value: 'md', flag: 'md', text: 'Moldova' },
  { code: 141, key: 'mc', value: 'mc', flag: 'mc', text: 'Monaco' },
  { code: 142, key: 'mn', value: 'mn', flag: 'mn', text: 'Mongolia' },
  { code: 143, key: 'me', value: 'me', flag: 'me', text: 'Montenegro' },
  { code: 144, key: 'ms', value: 'ms', flag: 'ms', text: 'Montserrat' },
  { code: 145, key: 'ma', value: 'ma', flag: 'ma', text: 'Morocco' },
  { code: 146, key: 'mz', value: 'mz', flag: 'mz', text: 'Mozambique' },
  { code: 147, key: 'na', value: 'na', flag: 'na', text: 'Namibia' },
  { code: 148, key: 'nr', value: 'nr', flag: 'nr', text: 'Nauru' },
  { code: 149, key: 'np', value: 'np', flag: 'np', text: 'Nepal' },
  { code: 150, key: 'an', value: 'an', flag: 'an', text: 'Netherlands Antilles' },
  { code: 151, key: 'nl', value: 'nl', flag: 'nl', text: 'Netherlands' },
  { code: 152, key: 'nc', value: 'nc', flag: 'nc', text: 'New Caledonia' },
  { code: 153, key: 'pg', value: 'pg', flag: 'pg', text: 'New Guinea' },
  { code: 154, key: 'nz', value: 'nz', flag: 'nz', text: 'New Zealand' },
  { code: 155, key: 'ni', value: 'ni', flag: 'ni', text: 'Nicaragua' },
  { code: 156, key: 'ne', value: 'ne', flag: 'ne', text: 'Niger' },
  { code: 157, key: 'ng', value: 'ng', flag: 'ng', text: 'Nigeria' },
  { code: 158, key: 'nu', value: 'nu', flag: 'nu', text: 'Niue' },
  { code: 159, key: 'nf', value: 'nf', flag: 'nf', text: 'Norfolk Island' },
  { code: 160, key: 'kp', value: 'kp', flag: 'kp', text: 'North Korea' },
  { code: 161, key: 'mp', value: 'mp', flag: 'mp', text: 'Northern Mariana Islands' },
  { code: 162, key: 'no', value: 'no', flag: 'no', text: 'Norway' },
  { code: 163, key: 'om', value: 'om', flag: 'om', text: 'Oman' },
  { code: 164, key: 'pk', value: 'pk', flag: 'pk', text: 'Pakistan' },
  { code: 165, key: 'pw', value: 'pw', flag: 'pw', text: 'Palau' },
  { code: 166, key: 'ps', value: 'ps', flag: 'ps', text: 'Palestine' },
  { code: 167, key: 'pa', value: 'pa', flag: 'pa', text: 'Panama' },
  { code: 168, key: 'py', value: 'py', flag: 'py', text: 'Paraguay' },
  { code: 169, key: 'pe', value: 'pe', flag: 'pe', text: 'Peru' },
  { code: 170, key: 'ph', value: 'ph', flag: 'ph', text: 'Philippines' },
  { code: 171, key: 'pn', value: 'pn', flag: 'pn', text: 'Pitcairn Islands' },
  { code: 172, key: 'pl', value: 'pl', flag: 'pl', text: 'Poland' },
  { code: 173, key: 'pt', value: 'pt', flag: 'pt', text: 'Portugal' },
  { code: 174, key: 'pr', value: 'pr', flag: 'pr', text: 'Puerto Rico' },
  { code: 175, key: 'qa', value: 'qa', flag: 'qa', text: 'Qatar' },
  { code: 176, key: 're', value: 're', flag: 're', text: 'Reunion' },
  { code: 177, key: 'ro', value: 'ro', flag: 'ro', text: 'Romania' },
  { code: 178, key: 'ru', value: 'ru', flag: 'ru', text: 'Russia' },
  { code: 179, key: 'rw', value: 'rw', flag: 'rw', text: 'Rwanda' },
  { code: 180, key: 'sh', value: 'sh', flag: 'sh', text: 'Saint Helena' },
  { code: 181, key: 'kn', value: 'kn', flag: 'kn', text: 'Saint Kitts and Nevis' },
  { code: 182, key: 'lc', value: 'lc', flag: 'lc', text: 'Saint Lucia' },
  { code: 183, key: 'pm', value: 'pm', flag: 'pm', text: 'Saint Pierre' },
  { code: 184, key: 'vc', value: 'vc', flag: 'vc', text: 'Saint Vincent' },
  { code: 185, key: 'ws', value: 'ws', flag: 'ws', text: 'Samoa' },
  { code: 186, key: 'sm', value: 'sm', flag: 'sm', text: 'San Marino' },
  { code: 187, key: 'gs', value: 'gs', flag: 'gs', text: 'Sandwich Islands' },
  { code: 188, key: 'st', value: 'st', flag: 'st', text: 'Sao Tome' },
  { code: 189, key: 'sa', value: 'sa', flag: 'sa', text: 'Saudi Arabia' },
  { code: 190, key: 'sn', value: 'sn', flag: 'sn', text: 'Senegal' },
  { code: 191, key: 'cs', value: 'cs', flag: 'cs', text: 'Serbia' },
  { code: 192, key: 'rs', value: 'rs', flag: 'rs', text: 'Serbia' },
  { code: 193, key: 'sc', value: 'sc', flag: 'sc', text: 'Seychelles' },
  { code: 194, key: 'sl', value: 'sl', flag: 'sl', text: 'Sierra Leone' },
  { code: 195, key: 'sg', value: 'sg', flag: 'sg', text: 'Singapore' },
  { code: 196, key: 'sk', value: 'sk', flag: 'sk', text: 'Slovakia' },
  { code: 197, key: 'si', value: 'si', flag: 'si', text: 'Slovenia' },
  { code: 198, key: 'sb', value: 'sb', flag: 'sb', text: 'Solomon Islands' },
  { code: 199, key: 'so', value: 'so', flag: 'so', text: 'Somalia' },
  { code: 200, key: 'za', value: 'za', flag: 'za', text: 'South Africa' },
  { code: 201, key: 'kr', value: 'kr', flag: 'kr', text: 'South Korea' },
  { code: 202, key: 'es', value: 'es', flag: 'es', text: 'Spain' },
  { code: 203, key: 'lk', value: 'lk', flag: 'lk', text: 'Sri Lanka' },
  { code: 204, key: 'sd', value: 'sd', flag: 'sd', text: 'Sudan' },
  { code: 205, key: 'sr', value: 'sr', flag: 'sr', text: 'Suriname' },
  { code: 206, key: 'sj', value: 'sj', flag: 'sj', text: 'Svalbard' },
  { code: 207, key: 'sz', value: 'sz', flag: 'sz', text: 'Swaziland' },
  { code: 208, key: 'se', value: 'se', flag: 'se', text: 'Sweden' },
  { code: 209, key: 'ch', value: 'ch', flag: 'ch', text: 'Switzerland' },
  { code: 210, key: 'sy', value: 'sy', flag: 'sy', text: 'Syria' },
  { code: 211, key: 'tw', value: 'tw', flag: 'tw', text: 'Taiwan' },
  { code: 212, key: 'tj', value: 'tj', flag: 'tj', text: 'Tajikistan' },
  { code: 213, key: 'tz', value: 'tz', flag: 'tz', text: 'Tanzania' },
  { code: 214, key: 'th', value: 'th', flag: 'th', text: 'Thailand' },
  { code: 215, key: 'tl', value: 'tl', flag: 'tl', text: 'Timorleste' },
  { code: 216, key: 'tg', value: 'tg', flag: 'tg', text: 'Togo' },
  { code: 217, key: 'tk', value: 'tk', flag: 'tk', text: 'Tokelau' },
  { code: 218, key: 'to', value: 'to', flag: 'to', text: 'Tonga' },
  { code: 219, key: 'tt', value: 'tt', flag: 'tt', text: 'Trinidad' },
  { code: 220, key: 'tn', value: 'tn', flag: 'tn', text: 'Tunisia' },
  { code: 221, key: 'tr', value: 'tr', flag: 'tr', text: 'Turkey' },
  { code: 222, key: 'tm', value: 'tm', flag: 'tm', text: 'Turkmenistan' },
  { code: 223, key: 'tv', value: 'tv', flag: 'tv', text: 'Tuvalu' },
  { code: 224, key: 'ug', value: 'ug', flag: 'ug', text: 'Uganda' },
  { code: 225, key: 'ua', value: 'ua', flag: 'ua', text: 'Ukraine' },
  { code: 226, key: 'ae', value: 'ae', flag: 'ae', text: 'United Arab Emirates' },
  { code: 227, key: 'us', value: 'us', flag: 'us', text: 'United States' },
  { code: 228, key: 'uy', value: 'uy', flag: 'uy', text: 'Uruguay' },
  { code: 229, key: 'um', value: 'um', flag: 'um', text: 'Us Minor Islands' },
  { code: 230, key: 'vi', value: 'vi', flag: 'vi', text: 'Us Virgin Islands' },
  { code: 231, key: 'uz', value: 'uz', flag: 'uz', text: 'Uzbekistan' },
  { code: 232, key: 'vu', value: 'vu', flag: 'vu', text: 'Vanuatu' },
  { code: 233, key: 'va', value: 'va', flag: 'va', text: 'Vatican City' },
  { code: 234, key: 've', value: 've', flag: 've', text: 'Venezuela' },
  { code: 235, key: 'vn', value: 'vn', flag: 'vn', text: 'Vietnam' },
  { code: 236, key: 'wf', value: 'wf', flag: 'wf', text: 'Wallis and Futuna' },
  { code: 237, key: 'eh', value: 'eh', flag: 'eh', text: 'Western Sahara' },
  { code: 238, key: 'ye', value: 'ye', flag: 'ye', text: 'Yemen' },
  { code: 239, key: 'zm', value: 'zm', flag: 'zm', text: 'Zambia' },
  { code: 240, key: 'zw', value: 'zw', flag: 'zw', text: 'Zimbabwe' },

]

export const languageOptions = [
  { key: 'Arabic', text: 'Arabic', value: 'Arabic' },
  { key: 'Chinese', text: 'Chinese', value: 'Chinese' },
  { key: 'Danish', text: 'Danish', value: 'Danish' },
  { key: 'Dutch', text: 'Dutch', value: 'Dutch' },
  { key: 'English', text: 'English', value: 'English' },
  { key: 'French', text: 'French', value: 'French' },
  { key: 'German', text: 'German', value: 'German' },
  { key: 'Greek', text: 'Greek', value: 'Greek' },
  { key: 'Hungarian', text: 'Hungarian', value: 'Hungarian' },
  { key: 'Italian', text: 'Italian', value: 'Italian' },
  { key: 'Japanese', text: 'Japanese', value: 'Japanese' },
  { key: 'Korean', text: 'Korean', value: 'Korean' },
  { key: 'Lithuanian', text: 'Lithuanian', value: 'Lithuanian' },
  { key: 'Persian', text: 'Persian', value: 'Persian' },
  { key: 'Polish', text: 'Polish', value: 'Polish' },
  { key: 'Portuguese', text: 'Portuguese', value: 'Portuguese' },
  { key: 'Russian', text: 'Russian', value: 'Russian' },
  { key: 'Spanish', text: 'Spanish', value: 'Spanish' },
  { key: 'Swedish', text: 'Swedish', value: 'Swedish' },
  { key: 'Turkish', text: 'Turkish', value: 'Turkish' },
  { key: 'Vietnamese', text: 'Vietnamese', value: 'Vietnamese' },
]

export const tagOptions = [
  {
    key: 'Important',
    text: 'Important',
    value: 'Important',
    label: { color: 'red', empty: true, circular: true },
  },
  {
    key: 'Announcement',
    text: 'Announcement',
    value: 'Announcement',
    label: { color: 'blue', empty: true, circular: true },
  },
  {
    key: 'Cannot Fix',
    text: 'Cannot Fix',
    value: 'Cannot Fix',
    label: { color: 'black', empty: true, circular: true },
  },
  {
    key: 'News',
    text: 'News',
    value: 'News',
    label: { color: 'purple', empty: true, circular: true },
  },
  {
    key: 'Enhancement',
    text: 'Enhancement',
    value: 'Enhancement',
    label: { color: 'orange', empty: true, circular: true },
  },
  {
    key: 'Change Declined',
    text: 'Change Declined',
    value: 'Change Declined',
    label: { empty: true, circular: true },
  },
  {
    key: 'Off Topic',
    text: 'Off Topic',
    value: 'Off Topic',
    label: { color: 'yellow', empty: true, circular: true },
  },
  {
    key: 'Interesting',
    text: 'Interesting',
    value: 'Interesting',
    label: { color: 'pink', empty: true, circular: true },
  },
  {
    key: 'Discussion',
    text: 'Discussion',
    value: 'Discussion',
    label: { color: 'green', empty: true, circular: true },
  },
]

export const getOptions = (number, prefix = 'Choice ') =>
  _.times(number, index => ({
    key: index,
    text: `${prefix}${index}`,
    value: index,
  }))