(define (domain ithar-quest)
  (:requirements :strips :typing :negative-preconditions)

  ;;------------------ TYPES ------------------
  (:types character location item)

  ;;---------------- CONSTANTS ----------------
  (:constants
     thandor abandoned_temple dark_forest
     collapsed_bridge malreks_tower            - location
     bow light_amulet crystal_of_ithar         - item)

  ;;---------------- PREDICATES ---------------
  (:predicates
    (at ?c - character ?l - location)
    (connected ?from - location ?to - location)
    (has ?c - character ?i - item)
    (item-at ?i - item ?l - location)
    (wood_collected)
    (bridge_rebuilt)
    (spirits_banished)
    (malrek_defeated)
  )

  ;;---------------- ACTIONS ------------------
  (:action move
    :parameters (?p - character ?from - location ?to - location)
    :precondition (and (at ?p ?from) (connected ?from ?to))
    :effect (and (not (at ?p ?from)) (at ?p ?to))
  )

  (:action gather-wood
    :parameters (?p - character)
    :precondition (and (at ?p dark_forest)
                       (not (wood_collected)))
    :effect (wood_collected)
  )

  (:action find-amulet
    :parameters (?p - character)
    :precondition (and (at ?p abandoned_temple)
                       (item-at light_amulet abandoned_temple))
    :effect (and (has ?p light_amulet)
                 (not (item-at light_amulet abandoned_temple)))
  )

  (:action banish-spirits
    :parameters (?p - character)
    :precondition (and (at ?p dark_forest)
                       (has ?p light_amulet)
                       (not (spirits_banished)))
    :effect (spirits_banished)
  )

  (:action rebuild-bridge
    :parameters (?p - character)
    :precondition (and (at ?p collapsed_bridge)
                       (wood_collected)
                       (not (bridge_rebuilt)))
    :effect (and (bridge_rebuilt)
                 (connected collapsed_bridge malreks_tower)
                 (connected malreks_tower collapsed_bridge))
  )

  (:action defeat-malrek
    :parameters (?p - character)
    :precondition (and (at ?p malreks_tower)
                       (bridge_rebuilt)
                       (spirits_banished)
                       (has ?p bow)
                       (item-at crystal_of_ithar malreks_tower)
                       (not (malrek_defeated)))
    :effect (and (malrek_defeated)
                 (has ?p crystal_of_ithar)
                 (not (item-at crystal_of_ithar malreks_tower)))
  )

  (:action return-to-thandor
    :parameters (?p - character)
    :precondition (and (at ?p malreks_tower)
                       (has ?p crystal_of_ithar))
    :effect (and (not (at ?p malreks_tower))
                 (at ?p thandor))
  )
)
