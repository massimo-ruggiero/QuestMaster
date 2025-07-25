(define (domain la-spada-di-luce)
  (:requirements :strips :typing)
  (:types
    character location item
  )

  (:predicates
    (at ?c - character ?l - location)
    (has ?c - character ?i - item)
    (fog-active)
    (creatures-active)
    (traps-active)
    (malakar-active)
    (sword-is-at-fortress)
    (fog-dispelled)
    (creatures-defeated)
    (traps-disarmed)
    (malakar-defeated)
    (path-to-fortress-open)
    (peace-restored)
    (consulted-elders)
    (equipment-prepared)
    (area-scouted)
    (found-loot)
  )

  (:action travel-to-forest
    :parameters (?c - character ?from - location ?to - location)
    :precondition (and
      (at ?c ?from)
    )
    :effect (and
      (not (at ?c ?from))
      (at ?c ?to)
    )
  )

  (:action consult-elders
    :parameters (?c - character ?l - location)
    :precondition (and
      (at ?c ?l)
      (not (consulted-elders))
    )
    :effect (and
      (consulted-elders)
    )
  )

  (:action prepare-equipment
    :parameters (?c - character ?l - location)
    :precondition (and
      (at ?c ?l)
      (not (equipment-prepared))
    )
    :effect (and
      (equipment-prepared)
    )
  )

  (:action dispel-fog-with-amulet
    :parameters (?c - character ?l - location ?i - item)
    :precondition (and
      (at ?c ?l)
      (has ?c ?i)
      (fog-active)
    )
    :effect (and
      (not (fog-active))
      (fog-dispelled)
    )
  )

  (:action fight-creatures
    :parameters (?c - character ?l - location)
    :precondition (and
      (at ?c ?l)
      (creatures-active)
    )
    :effect (and
      (not (creatures-active))
      (creatures-defeated)
    )
  )

  (:action sneak-past-creatures
    :parameters (?c - character ?l - location)
    :precondition (and
      (at ?c ?l)
      (creatures-active)
    )
    :effect (and
      (not (creatures-active))
      (creatures-defeated)
    )
  )

  (:action open-path-to-fortress
    :parameters (?c - character ?l - location)
    :precondition (and
      (at ?c ?l)
      (fog-dispelled)
      (creatures-defeated)
    )
    :effect (and
      (path-to-fortress-open)
    )
  )

  (:action travel-to-fortress
    :parameters (?c - character ?from - location ?to - location)
    :precondition (and
      (at ?c ?from)
      (path-to-fortress-open)
    )
    :effect (and
      (not (at ?c ?from))
      (at ?c ?to)
    )
  )

  (:action disarm-traps
    :parameters (?c - character ?l - location)
    :precondition (and
      (at ?c ?l)
      (traps-active)
    )
    :effect (and
      (not (traps-active))
      (traps-disarmed)
    )
  )

  (:action find-secret-passage
    :parameters (?c - character ?l - location)
    :precondition (and
      (at ?c ?l)
      (traps-active)
    )
    :effect (and
      (not (traps-active))
      (traps-disarmed)
    )
  )

  (:action duel-malakar
    :parameters (?c - character ?l - location)
    :precondition (and
      (at ?c ?l)
      (traps-disarmed)
      (malakar-active)
    )
    :effect (and
      (not (malakar-active))
      (malakar-defeated)
    )
  )

  (:action search-for-loot
    :parameters (?c - character ?l - location)
    :precondition (and
      (at ?c ?l)
      (traps-disarmed)
      (not (found-loot))
    )
    :effect (and
      (found-loot)
    )
  )

  (:action retrieve-sword
    :parameters (?c - character ?i - item ?l - location)
    :precondition (and
      (at ?c ?l)
      (malakar-defeated)
      (sword-is-at-fortress)
    )
    :effect (and
      (has ?c ?i)
      (not (sword-is-at-fortress))
    )
  )

  (:action return-to-lumina-with-sword
    :parameters (?c - character ?i - item ?from - location ?to - location)
    :precondition (and
      (has ?c ?i)
      (at ?c ?from)
    )
    :effect (and
      (not (at ?c ?from))
      (at ?c ?to)
      (peace-restored)
    )
  )

  (:action conquer-fortress-and-return-victorious
    :parameters (?c - character ?i - item ?from - location ?to - location)
    :precondition (and
      (at ?c ?from)
      (traps-active)
      (malakar-active)
      (sword-is-at-fortress)
    )
    :effect (and
      (not (at ?c ?from))
      (at ?c ?to)
      (not (traps-active))
      (traps-disarmed)
      (not (malakar-active))
      (malakar-defeated)
      (not (sword-is-at-fortress))
      (has ?c ?i)
      (peace-restored)
    )
  )
)