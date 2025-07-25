(define (domain la-conquista-delle-stelle-perdute)
  (:requirements :strips :typing :equality)
  (:types
    character ship location crystal hazard
  )

  (:constants
    zara - character
    stella-errante - ship
    zenthara-station jade-planet fire-planet desolate-planet - location
    crystal-of-jade crystal-of-fire - crystal
    sand-storms lava-creatures - hazard
  )

  (:predicates
    (at-ship ?s - ship ?l - location)
    (engine-needs-repair ?s - ship)
    (engine-repaired ?s - ship)
    (ship-has-resources ?s - ship)
    (crystal-is-at ?cr - crystal ?l - location)
    (character-has-crystal ?c - character ?cr - crystal)
    (vex-has-crystal ?cr - crystal)
    (hazard-is-at ?h - hazard ?l - location)
    (hazard-is-overcome ?h - hazard)
    (hunter-is-unencountered)
    (hunter-is-encountered)
    (is-allied-with-hunter)
    (vex-is-active)
    (vex-is-defeated)
    (vex-is-at ?l - location)
    (power-is-awakened)
    (path-is-known ?from - location ?to - location)
    (nebula-path-is-known ?from - location ?to - location)
    (all-crystals-reunited)
    (planet-is-safe ?l - location)
  )

  (:action prepare-for-expedition
    :parameters (?s - ship)
    :precondition (and
      (at-ship ?s zenthara-station)
      (engine-needs-repair ?s)
      (not (ship-has-resources ?s))
    )
    :effect (and
      (not (engine-needs-repair ?s))
      (engine-repaired ?s)
      (ship-has-resources ?s)
    )
  )

  (:action emergency-repair
    :parameters (?s - ship)
    :precondition (and
      (at-ship ?s zenthara-station)
      (engine-needs-repair ?s)
    )
    :effect (and
      (not (engine-needs-repair ?s))
      (engine-repaired ?s)
    )
  )

  (:action travel
    :parameters (?s - ship ?from - location ?to - location)
    :precondition (and
      (at-ship ?s ?from)
      (engine-repaired ?s)
      (path-is-known ?from ?to)
    )
    :effect (and
      (not (at-ship ?s ?from))
      (at-ship ?s ?to)
    )
  )

  (:action explore-planet-and-retrieve-crystal
    :parameters (?c - character ?s - ship ?cr - crystal ?h - hazard ?l - location)
    :precondition (and
      (at-ship ?s ?l)
      (ship-has-resources ?s)
      (crystal-is-at ?cr ?l)
      (hazard-is-at ?h ?l)
      (not (hazard-is-overcome ?h))
    )
    :effect (and
      (character-has-crystal ?c ?cr)
      (not (crystal-is-at ?cr ?l))
      (hazard-is-overcome ?h)
      (planet-is-safe ?l)
    )
  )

  (:action encounter-and-ally-with-hunter
    :parameters (?s - ship)
    :precondition (and
      (at-ship ?s jade-planet)
      (hunter-is-unencountered)
    )
    :effect (and
      (not (hunter-is-unencountered))
      (hunter-is-encountered)
      (is-allied-with-hunter)
      (path-is-known jade-planet fire-planet)
      (path-is-known fire-planet jade-planet)
      (nebula-path-is-known fire-planet desolate-planet)
    )
  )

  (:action navigate-nebula
    :parameters (?s - ship ?from - location ?to - location)
    :precondition (and
      (at-ship ?s ?from)
      (engine-repaired ?s)
      (is-allied-with-hunter)
      (nebula-path-is-known ?from ?to)
    )
    :effect (and
      (not (at-ship ?s ?from))
      (at-ship ?s ?to)
    )
  )

  (:action confront-lord-vex
    :parameters (?c - character ?s - ship ?l - location)
    :precondition (and
      (at-ship ?s ?l)
      (vex-is-at ?l)
      (vex-is-active)
      (character-has-crystal ?c crystal-of-jade)
      (character-has-crystal ?c crystal-of-fire)
    )
    :effect (and
      (not (vex-is-active))
      (vex-is-defeated)
    )
  )

  (:action reunite-crystals-and-awaken-power
    :parameters (?c - character ?cr1 - crystal ?cr2 - crystal)
    :precondition (and
      (vex-is-defeated)
      (character-has-crystal ?c ?cr1)
      (character-has-crystal ?c ?cr2)
      (not (= ?cr1 ?cr2))
    )
    :effect (and
      (all-crystals-reunited)
      (power-is-awakened)
    )
  )
)