import ruNav from './ru/nav.json'
import ruErrors from './ru/errors.json'
import ruValidation from './ru/validation.json'
import ruAuthCallback from './ru/auth_callback.json'
import ruHome from './ru/home.json'
import ruTournamentCard from './ru/tournament_card.json'
import ruRegistration from './ru/registration.json'
import ruTournament from './ru/tournament.json'
import ruStats from './ru/stats.json'
import ruManager from './ru/manager.json'

const ru = {
  ...ruNav,
  ...ruErrors,
  ...ruValidation,
  ...ruAuthCallback,
  ...ruHome,
  ...ruTournamentCard,
  ...ruRegistration,
  ...ruTournament,
  ...ruStats,
  ...ruManager,
}

export default { ru }
