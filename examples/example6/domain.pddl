(define (domain shadows-of-the-iron-citadel)
  (:requirements :strips :typing)
  (:types
    character location item
  )

  (:constants
    outer-bailey gatehouse vault core-chamber - location
    echo-of-creation - item
  )

  (:predicates
    (at ?c - character ?l - location)
    (has ?c - character ?i - item)
    (gate-is-sealed)
    (gate-is-open)
    (sentinels-are-active)
    (sentinels-are-bypassed)
    (warden-is-active)
    (warden-is-pacified)
    (core-is-unstable)
    (core-is-recalibrated)
    (echo-is-in-vault)
    (has-sigil-fragment)
    (sigil-is-studied)
    (prepared-for-brute-force)
    (diversion-is-created)
  )

  (:action find-sigil-fragment
    :parameters (?c - character)
    :precondition (and
      (at ?c outer-bailey)
      (gate-is-sealed)
    )
    :effect (and
      (has-sigil-fragment)
    )
  )

  (:action study-sigil-fragment
    :parameters (?c - character)
    :precondition (and
      (at ?c outer-bailey)
      (has-sigil-fragment)
    )
    :effect (and
      (sigil-is-studied)
    )
  )

  (:action decode-gate-and-enter
    :parameters (?c - character)
    :precondition (and
      (at ?c outer-bailey)
      (gate-is-sealed)
      (sigil-is-studied)
    )
    :effect (and
      (not (at ?c outer-bailey))
      (at ?c gatehouse)
      (not (gate-is-sealed))
      (gate-is-open)
    )
  )

  (:action prepare-brute-force
    :parameters (?c - character)
    :precondition (and
      (at ?c outer-bailey)
      (gate-is-sealed)
    )
    :effect (and
      (prepared-for-brute-force)
    )
  )

  (:action force-gate-and-enter
    :parameters (?c - character)
    :precondition (and
      (at ?c outer-bailey)
      (gate-is-sealed)
      (prepared-for-brute-force)
    )
    :effect (and
      (not (at ?c outer-bailey))
      (at ?c gatehouse)
      (not (gate-is-sealed))
      (gate-is-open)
    )
  )

  (:action create-diversion
    :parameters (?c - character)
    :precondition (and
      (at ?c gatehouse)
      (sentinels-are-active)
    )
    :effect (and
      (diversion-is-created)
    )
  )

  (:action sneak-past-sentinels-and-navigate
    :parameters (?c - character)
    :precondition (and
      (at ?c gatehouse)
      (sentinels-are-active)
      (diversion-is-created)
    )
    :effect (and
      (not (at ?c gatehouse))
      (at ?c vault)
      (not (sentinels-are-active))
      (sentinels-are-bypassed)
    )
  )

  (:action retrieve-echo
    :parameters (?c - character)
    :precondition (and
      (at ?c vault)
      (echo-is-in-vault)
    )
    :effect (and
      (has ?c echo-of-creation)
      (not (echo-is-in-vault))
    )
  )

  (:action pacify-warden-and-enter-core
    :parameters (?c - character)
    :precondition (and
      (at ?c vault)
      (warden-is-active)
      (has ?c echo-of-creation)
    )
    :effect (and
      (not (at ?c vault))
      (at ?c core-chamber)
      (not (warden-is-active))
      (warden-is-pacified)
    )
  )

  (:action recalibrate-core
    :parameters (?c - character)
    :precondition (and
      (at ?c core-chamber)
      (core-is-unstable)
      (warden-is-pacified)
      (has ?c echo-of-creation)
    )
    :effect (and
      (not (core-is-unstable))
      (core-is-recalibrated)
    )
  )
)