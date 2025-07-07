(define (domain sunken-temple)
  (:requirements :strips :typing :equality)
  (:types
    location gear creature obstacle
  )
  (:constants
    thalara-harbor dive-vessel coral-chasm eastern-hall sanctum - location
    stabilizer                     - gear
    coral-currents collapsed-passage - obstacle
    guardian-eels                  - creature
  )
  (:predicates
    (at ?l - location)
    (has-gear ?g - gear)
    (stormy-sea)
    (poor-visibility)
    (cleared ?o - obstacle)
    (distracted ?c - creature)
    (creature-at ?c - creature ?l - location)
    (relic-secured)
    (safe-on-surface)
    (path-open ?from - location ?to - location)
    (visited ?l - location)
  )

  (:action embark
    :parameters ()
    :precondition (and
      (at thalara-harbor)
      (path-open thalara-harbor dive-vessel)
    )
    :effect (and
      (not (at thalara-harbor))
      (at dive-vessel)
      (visited dive-vessel)
    )
  )

  (:action deploy-stabilizer
    :parameters ()
    :precondition (and
      (at dive-vessel)
      (has-gear stabilizer)
      (not (cleared coral-currents))
    )
    :effect (cleared coral-currents)
  )

  (:action enter-chasm
    :parameters ()
    :precondition (and
      (at dive-vessel)
      (path-open dive-vessel coral-chasm)
      (cleared coral-currents)
    )
    :effect (and
      (not (at dive-vessel))
      (at coral-chasm)
      (visited coral-chasm)
    )
  )

  (:action traverse-hall
    :parameters ()
    :precondition (and
      (at coral-chasm)
      (path-open coral-chasm eastern-hall)
    )
    :effect (and
      (not (at coral-chasm))
      (at eastern-hall)
      (visited eastern-hall)
    )
  )

  (:action clear-rubble
    :parameters ()
    :precondition (and
      (at eastern-hall)
      (not (cleared collapsed-passage))
    )
    :effect (cleared collapsed-passage)
  )

  (:action enter-sanctum
    :parameters ()
    :precondition (and
      (at eastern-hall)
      (path-open eastern-hall sanctum)
      (cleared collapsed-passage)
    )
    :effect (and
      (not (at eastern-hall))
      (at sanctum)
      (visited sanctum)
    )
  )

  (:action fight-eels
    :parameters ()
    :precondition (and
      (at sanctum)
      (creature-at guardian-eels sanctum)
      (not (distracted guardian-eels))
    )
    :effect (distracted guardian-eels)
  )

  (:action retrieve-relic
    :parameters ()
    :precondition (and
      (at sanctum)
      (creature-at guardian-eels sanctum)
      (distracted guardian-eels)
    )
    :effect (relic-secured)
  )

  (:action surface
    :parameters ()
    :precondition (and
      (at sanctum)
      (relic-secured)
    )
    :effect (safe-on-surface)
  )
)