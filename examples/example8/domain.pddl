(define (domain eldoria-quest)
  (:requirements :strips :typing :negative-preconditions)
  (:types character item location flora spirit)

  (:constants
    healing_herb map_of_eldoria - item
    cursed_plant - flora
    grove_entrance grove_interior village - location
  )

  (:predicates
    (at ?c - character ?l - location)
    (has ?c - character ?i - item)
    (connected ?from - location ?to - location)
    (grove_is_cursed)
    (grove_is_restored)
    (plant_is_hostile ?f - flora)
    (plant_is_pacified ?f - flora)
    (is_prepared)
    (has_foraged)
    (knows_curse_source)
  )

  (:action move
    :parameters (?c - character ?from - location ?to - location)
    :precondition (and
      (at ?c ?from)
      (connected ?from ?to)
    )
    :effect (and
      (not (at ?c ?from))
      (at ?c ?to)
    )
  )

  (:action prepare_at_village
    :parameters (?c - character)
    :precondition (and
      (at ?c village)
      (not (is_prepared))
    )
    :effect (and
      (is_prepared)
    )
  )

  (:action pacify_hostile_plant
    :parameters (?c - character ?f - flora)
    :precondition (and
      (at ?c grove_interior)
      (has ?c healing_herb)
      (plant_is_hostile ?f)
    )
    :effect (and
      (not (plant_is_hostile ?f))
      (plant_is_pacified ?f)
      (not (has ?c healing_herb))
    )
  )

  (:action confront_nox
    :parameters (?c - character ?s - spirit)
    :precondition (and
      (at ?c grove_interior)
      (plant_is_pacified cursed_plant)
      (not (knows_curse_source))
    )
    :effect (and
      (knows_curse_source)
    )
  )

  (:action resolve_curse
    :parameters (?c - character)
    :precondition (and
      (at ?c grove_interior)
      (knows_curse_source)
      (grove_is_cursed)
    )
    :effect (and
      (not (grove_is_cursed))
      (grove_is_restored)
    )
  )

  (:action forage_in_grove
    :parameters (?c - character)
    :precondition (and
      (at ?c grove_interior)
      (grove_is_restored)
    )
    :effect (and
      (has_foraged)
    )
  )
)