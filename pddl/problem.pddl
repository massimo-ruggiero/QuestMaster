(define (problem shattered-kingdom-quest)
  (:domain shattered-kingdom)
  (:objects
    elara - hero
    malakar - sorcerer
    elves dwarves - faction
    windhaven forestofwhispers cursedmarsh dwarvenstronghold fortressofshadows - location
    crystalfragment elvenfragment dwarvenfragment - fragment
  )

  (:init
    (at elara windhaven)
    (is-village windhaven)
    (has-fragment elara crystalfragment)
    (sorcerer-at malakar fortressofshadows)
    (malakar-is-active)

    (faction-at elves forestofwhispers)
    (faction-at dwarves dwarvenstronghold)

    (faction-holds-fragment elves elvenfragment)
    (faction-holds-fragment dwarves dwarvenfragment)

    (faction-is-distrustful elves)
    (faction-is-distrustful dwarves)

    (connected windhaven forestofwhispers)
    (connected forestofwhispers windhaven)
    (connected forestofwhispers cursedmarsh)
    (connected cursedmarsh forestofwhispers)
    (connected cursedmarsh dwarvenstronghold)
    (connected dwarvenstronghold cursedmarsh)
    (connected dwarvenstronghold fortressofshadows)
    (connected fortressofshadows dwarvenstronghold)

    (path-is-stormy windhaven forestofwhispers)
    (path-has-bandits cursedmarsh dwarvenstronghold)
  )

  (:goal (and
    (malakar-is-defeated)
    (crystal-is-restored)
  ))
)